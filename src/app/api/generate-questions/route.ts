import { NextResponse } from "next/server";
import { VertexAI } from "@google-cloud/vertexai";
import mammoth from "mammoth";

// =============================================================
//               🔐 ENV VALIDATION + BASE64 LOADER
// =============================================================

if (!process.env.GCP_PROJECT_ID) {
  throw new Error("Missing GCP_PROJECT_ID env variable");
}

if (!process.env.GOOGLE_SERVICE_ACCOUNT_BASE64) {
  throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_BASE64 env variable");
}

// Decode Base64 Service Account JSON for Vercel
function loadCredentials() {
  const base64 = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64!;
  const json = Buffer.from(base64, "base64").toString("utf8");
  return JSON.parse(json);
}

// Create Vertex Client (Vercel Friendly)
function createVertexClient() {
  const credentials = loadCredentials();

  return new VertexAI({
    project: process.env.GCP_PROJECT_ID!,
    location: "us-central1",
    googleAuthOptions: {
      credentials, // <= THIS IS THE CORRECT WAY
    },
  });
}

// =============================================================
//                      MODEL CONFIG
// =============================================================

const PREFERRED_MODELS = [
  `projects/${process.env.GCP_PROJECT_ID}/locations/us-central1/publishers/google/models/gemini-2.0-flash`,
  `projects/${process.env.GCP_PROJECT_ID}/locations/us-central1/models/gemini-2.0-flash`,
  "models/gemini-2.0-flash",
  "google/gemini-2.0-flash",
];

async function getAvailableModel() {
  const vertex = createVertexClient();
  let lastErr: any = null;

  for (const modelId of PREFERRED_MODELS) {
    try {
      return vertex.getGenerativeModel({
        model: modelId,
        generationConfig: { responseMimeType: "application/json" },
      });
    } catch (err) {
      lastErr = err;
    }
  }

  throw lastErr || new Error("No available Vertex model found");
}

// =============================================================
//                      MAIN HANDLER
// =============================================================

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // ---------- A: File Upload Mode ----------
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      const fileText = await extractTextFromFile(file);

      const jobPosition = String(formData.get("jobPosition") || "");
      const jobDescription = String(formData.get("jobDescription") || "");
      const interviewTypes = JSON.parse(
        String(formData.get("interviewType") || "[]")
      ) as string[];

      const prompt = buildReviewPrompt(fileText, jobPosition, jobDescription, interviewTypes);
      const aiResponse = await generateAIContent(prompt);

      return NextResponse.json(normalizeToType2(aiResponse, interviewTypes));
    }

    // ---------- B: JSON Body Mode ----------
    if (contentType.includes("application/json")) {
      const body = await request.json();

      const {
        jobPosition = "",
        jobDescription = "",
        interviewDuration = "",
        interviewType = [],
        experienceLevel = "Mid",
      } = body;

      const prompt = buildGenerationPrompt(
        String(jobPosition),
        String(jobDescription),
        String(interviewDuration),
        Array.isArray(interviewType) ? interviewType : [String(interviewType)],
        String(experienceLevel)
      );

      const aiResponse = await generateAIContent(prompt);
      return NextResponse.json(normalizeToType2(aiResponse));
    }

    return NextResponse.json(
      { error: "Unsupported Content-Type" },
      { status: 415 }
    );
  } catch (err: any) {
    console.error("Error in /api/generate-questions:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// =============================================================
//                TEXT EXTRACTION HELPERS
// =============================================================

async function extractTextFromFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const mime = file.type;

  if (mime === "application/pdf") return extractUsingGemini(buffer, mime);

  if (mime.startsWith("image/")) return extractUsingGemini(buffer, mime);

  if (
    mime ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result?.value || "";
  }

  if (mime === "application/msword") return buffer.toString("utf-8");

  return buffer.toString("utf-8");
}

// Extract text from PDF or Image using Gemini Vision
async function extractUsingGemini(buffer: Buffer, mimeType: string) {
  const base64 = buffer.toString("base64");
  const model = await getAvailableModel();

  const result = await model.generateContent({
    contents: [
      { role: "user", parts: [{ text: "Extract all readable plain text." }] },
      {
        role: "user",
        parts: [
          {
            inlineData: { mimeType, data: base64 },
          },
        ],
      },
    ],
  });

  return (
    result?.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ""
  );
}

// =============================================================
//                AI QUESTION GENERATION LOGIC
// =============================================================

async function generateAIContent(prompt: string) {
  const model = await getAvailableModel();

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const raw = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!raw) throw new Error("Vertex returned empty response");

  return JSON.parse(raw);
}

// =============================================================
//                NORMALIZER (Final Output Formatting)
// =============================================================

function normalizeToType2(aiResponse: any, selectedTypes?: string[]) {
  const output: { questions: { question: string; type: string }[] } = {
    questions: [],
  };

  if (!aiResponse?.questions) return output;

  const singleType =
    Array.isArray(selectedTypes) && selectedTypes.length === 1
      ? selectedTypes[0]
      : "";

  if (Array.isArray(aiResponse.questions)) {
    output.questions = aiResponse.questions.map((q: any) => ({
      question: String(q.question || "").trim(),
      type: singleType || q.type || "",
    }));
    return output;
  }

  Object.values(aiResponse.questions).forEach((list: any) => {
    if (Array.isArray(list)) {
      list.forEach((q) => {
        if (typeof q === "string" && q.trim()) {
          output.questions.push({
            question: q.trim(),
            type: singleType || "",
          });
        }
      });
    }
  });

  return output;
}

// =============================================================
//                PROMPT BUILDERS
// =============================================================

function buildGenerationPrompt(
  jobPosition: string,
  jobDescription: string,
  interviewDuration: string,
  interviewType: string[],
  experienceLevel: string
): string {
  const selectedTypes =
    interviewType.length > 0
      ? interviewType
      : ["Technical", "Behavioral", "Experience", "Problem Solving", "Leadership"];

  const typesStr = selectedTypes.join(", ");

  const experienceGuidelines: Record<string, string> = {
    Junior:
      "Ask simple, beginner questions",
    Mid: "Ask practical, scenario-based questions",
    Senior:
      "Ask deep, architectural, and leadership questions",
  };

  return `
Generate EXACTLY 30 interview questions.
Types: ${typesStr}
Job Role: ${jobPosition}
Experience: ${experienceLevel}

Rules:
- Even distribution across selected types
- Unique questions
- JSON output only

Job Description:
${jobDescription}
`;
}

function buildReviewPrompt(
  fileText: string,
  jobPosition: string,
  jobDescription: string,
  interviewTypes: string[]
): string {
  return `
Extract ONLY interview questions from this document.

Output:
{
  "questions": [
    { "question": "string" }
  ]
}

Document:
${fileText}
`;
}
