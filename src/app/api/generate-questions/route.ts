// ------------------------------------------
// FORCE NODE RUNTIME (CRITICAL FOR VERCEL)
// ------------------------------------------
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { VertexAI } from "@google-cloud/vertexai";
import { GoogleAuth } from "google-auth-library";
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
  console.log("Decoding Base64 credentials...");
  const base64 = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64!;
  const json = Buffer.from(base64, "base64").toString("utf8");
  const creds = JSON.parse(json);
  console.log("Decoded service account email:", creds.client_email);
  return creds;
}

// Create Vertex Client (Vercel Friendly)
function createVertexClient() {
  const credentials = loadCredentials();

  console.log("Creating VertexAI client…");

  return new VertexAI({
    project: process.env.GCP_PROJECT_ID!,
    location: "us-central1",
    googleAuthOptions: {
      credentials,
    },
  });
}

// =============================================================
//                      MODEL CONFIG
// =============================================================

const PREFERRED_MODELS = [
  "gemini-1.5-flash",
  "gemini-1.5-pro",
];

async function getAvailableModel() {
  const vertex = createVertexClient();
  let lastErr: any = null;

  for (const modelId of PREFERRED_MODELS) {
    try {
      console.log("Trying model:", modelId);
      const model = vertex.getGenerativeModel({
        model: modelId,
        generationConfig: { responseMimeType: "application/json" },
      });
      console.log("Loaded model successfully:", modelId);
      return model;
    } catch (err) {
      console.error("Model failed:", modelId, err);
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

      console.log("Processing uploaded file:", file.name);

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

      console.log("Generating questions for:", jobPosition);

      const prompt = buildGenerationPrompt(
        jobPosition,
        jobDescription,
        interviewDuration,
        Array.isArray(interviewType) ? interviewType : [String(interviewType)],
        experienceLevel
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
  console.log("Extracting text from file with MIME:", file.type);

  const buffer = Buffer.from(await file.arrayBuffer());
  const mime = file.type;

  if (mime === "application/pdf") return extractUsingGemini(buffer, mime);
  if (mime.startsWith("image/")) return extractUsingGemini(buffer, mime);

  if (
    mime ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    console.log("Extracting DOCX via Mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result?.value || "";
  }

  return buffer.toString("utf-8");
}

// Extract text from PDF or Image using Gemini Vision
async function extractUsingGemini(buffer: Buffer, mimeType: string) {
  console.log("Extracting via Gemini Vision with mime:", mimeType);

  const base64 = buffer.toString("base64");
  const model = await getAvailableModel();

  const result = await model.generateContent({
    contents: [
      { role: "user", parts: [{ text: "Extract readable text only." }] },
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

  const text =
    result?.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

  console.log("Gemini Vision Extracted Text Length:", text.length);

  return text;
}

// =============================================================
//                AI QUESTION GENERATION LOGIC
// =============================================================

async function generateAIContent(prompt: string) {
  console.log("Sending prompt to Vertex:", prompt.slice(0, 200));

  const model = await getAvailableModel();

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const raw =
    result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  console.log("Raw Vertex Output:", raw);

  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error("JSON parse failed. Raw output:", raw);
    throw new Error("Vertex returned invalid JSON");
  }
}

// =============================================================
//                NORMALIZER (Final Output Formatting)
// =============================================================

function normalizeToType2(aiResponse: any, selectedTypes?: string[]) {
  const output: { questions: { question: string; type: string }[] } = {
    questions: [],
  };

  if (!aiResponse?.questions) {
    console.log("AI Response missing questions field");
    return output;
  }

  const singleType =
    Array.isArray(selectedTypes) && selectedTypes.length === 1
      ? selectedTypes[0]
      : "";

  if (Array.isArray(aiResponse.questions)) {
    return {
      questions: aiResponse.questions.map((q: any) => ({
        question: q.question?.trim() || "",
        type: singleType || q.type || "",
      })),
    };
  }

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
