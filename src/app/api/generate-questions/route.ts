import { NextResponse } from "next/server";
import { VertexAI } from "@google-cloud/vertexai";
import mammoth from "mammoth";

/**
 * Required env:
 *  - GCP_PROJECT_ID
 *  - GOOGLE_APPLICATION_CREDENTIALS (absolute path to service account JSON)
 *
 * Make sure Vertex AI / Model Garden / Generative Language APIs are enabled
 * on the project (zuntra-interview-ai).
 */

// ---------- basic env checks ----------

const pdf = require("pdf-parse");


if (!process.env.GCP_PROJECT_ID) {
  throw new Error("Missing GCP_PROJECT_ID env var");
}
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  throw new Error(
    "Missing GOOGLE_APPLICATION_CREDENTIALS env var (path to service account JSON)"
  );
}

// ---------- Vertex client (re-used) ----------
const vertex = new VertexAI({
  project: process.env.GCP_PROJECT_ID,
  location: "us-central1",
  googleAuthOptions: {
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  },
});

// Preferred model choices (order = preference/fallback)
const PREFERRED_MODELS = [
  // publisher full resource path (works where publisher models are used)
  `projects/${process.env.GCP_PROJECT_ID}/locations/us-central1/publishers/google/models/gemini-2.0-flash`,
  // model garden full resource (some SDKs expect this)
  `projects/${process.env.GCP_PROJECT_ID}/locations/us-central1/models/gemini-2.0-flash`,
  // Model Garden short id / Model Garden Garden ID
  "models/gemini-2.0-flash",
  // alternate short form (some older SDKs used this)
  "google/gemini-2.0-flash",
];

// Utility: attempt to build a generative model using the first working model id
async function getAvailableModel() {
  let lastErr: any = null;
  for (const modelId of PREFERRED_MODELS) {
    try {
      const candidate = vertex.getGenerativeModel({
        model: modelId,
        generationConfig: { responseMimeType: "application/json" },
      });
      // quick test call to ensure model is usable (lightweight test)
      // Some SDKs create a client only; we will return candidate and let caller call generateContent.
      return candidate;
    } catch (err) {
      lastErr = err;
      // try next
    }
  }
  // If none succeeded, throw the last error.
  throw lastErr || new Error("No available Vertex model found");
}

// ---------- Main handler ----------
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // Case A: multipart/form-data (file review)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      const fileText = await extractTextFromFile(file);
      const jobPosition = String(formData.get("jobPosition") || "").trim();
      const jobDescription = String(formData.get("jobDescription") || "").trim();
      const interviewTypes = JSON.parse(
        String(formData.get("interviewType") || "[]")
      ) as string[];

      const prompt = buildReviewPrompt(
        fileText,
        jobPosition,
        jobDescription,
        interviewTypes
      );

      const aiResponse = await generateAIContent(prompt);
      return NextResponse.json(normalizeToType2(aiResponse));
    }

    // Case B: application/json (generate new questions)
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
        Array.isArray(interviewType) ? (interviewType as string[]) : [String(interviewType)],
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
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ---------- Helpers ----------

async function extractTextFromFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (file.type === "application/pdf") {
    const data = await pdf(buffer);
    return data.text || "";
  }

  if (
    file.type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result?.value || "";
  }

  // older .doc
  if (file.type === "application/msword") {
    return buffer.toString("utf-8");
  }

  // fallback: try UTF-8 conversion
  return buffer.toString("utf-8");
}

async function generateAIContent(prompt: string) {
  try {
    // Resolve the best model instance at runtime (handles SDK model-id differences)
    const model = await getAvailableModel();

    // Make the call
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    // The SDK response shape can vary slightly; we try to read the text defensively.
    const rawText =
      (result as any)?.response?.candidates?.[0]?.content?.parts?.[0]?.text ??
      (result as any)?.response?.text?.() ??
      (result as any)?.response?.[0]?.text;

    if (!rawText) {
      // Dump the whole result for debugging
      console.error("Vertex raw result (unexpected shape):", JSON.stringify(result, null, 2));
      throw new Error("No text returned from Vertex model");
    }

    // Expect the model to return a JSON string exactly as specified in your prompts.
    // Parse and return it.
    return JSON.parse(rawText);
  } catch (err: any) {
    console.error("Vertex Generation Error:", err);
    // Re-throw so handler returns 500 and logs show details.
    throw err;
  }
}

// Normalizer: converts many shapes to the Type2 format you expect
function normalizeToType2(aiResponse: any) {
  const output: { questions: { question: string; type: string }[] } = {
    questions: [],
  };

  if (!aiResponse || !aiResponse.questions) return output;

  // Case A: already an array of {question, type}
  if (Array.isArray(aiResponse.questions)) {
    output.questions = aiResponse.questions
      .filter((q: any) => q?.question && q?.type)
      .map((q: any) => ({
        question: String(q.question).trim(),
        type: String(q.type).trim(),
      }));
    return output;
  }

  // Case B: grouped object { technical: ["q1","q2"], soft: ["q1"] }
  Object.entries(aiResponse.questions).forEach(([type, list]) => {
    if (Array.isArray(list)) {
      (list as string[]).forEach((q: string) => {
        if (typeof q === "string" && q.trim()) {
          output.questions.push({ question: q.trim(), type });
        }
      });
    }
  });

  return output;
}

// ---------- Prompt builders ----------
function buildGenerationPrompt(
  jobPosition: string,
  jobDescription: string,
  interviewDuration: string,
  interviewType: string[],
  experienceLevel: string
): string {
  const typesString = interviewType.join(", ") || "technical,behavioral";

  let questionCountRange = "5–7";
  if (interviewDuration.includes("5")) questionCountRange = "3–5";
  else if (interviewDuration.includes("15")) questionCountRange = "6–10";
  else if (interviewDuration.includes("30")) questionCountRange = "11–15";
  else if (interviewDuration.includes("45")) questionCountRange = "16–20";
  else if (interviewDuration.includes("60")) questionCountRange = "21–25";

  const experienceGuidelines: Record<string, string> = {
    Junior: "Focus on basic conceptual understanding and simple problem-solving.",
    Mid: "Include scenario-based questions testing applied knowledge and debugging.",
    Senior:
      "Include advanced, design-level questions that assess architecture and leadership.",
  };

  const levelGuideline =
    experienceGuidelines[experienceLevel] ||
    "Generate questions relevant to the experience level.";

  return `You are an expert AI interviewer that generates professional interview questions.

Job Role: ${jobPosition}
Experience Level: ${experienceLevel}
Job Description: ${jobDescription}
Interview Duration: ${interviewDuration}
Requested Question Types: ${typesString}

Guidelines:
1. Generate approximately ${questionCountRange} unique, high-quality questions.
2. Each question must include both "question" and its "type".
3. The "type" value must be exactly one of: ${typesString}.
4. Align questions with the specified experience level:
   ${levelGuideline}
5. Avoid redundancy and irrelevant questions.
6. Respond ONLY with pure JSON in this structure:

{
  "questions": [
    { "question": "string", "type": "string" },
    { "question": "string", "type": "string" }
  ]
}

Do NOT include any explanation or commentary.`;
}

function buildReviewPrompt(
  fileText: string,
  jobPosition: string,
  jobDescription: string,
  interviewTypes: string[]
): string {
  const typesString = interviewTypes.join(", ") || "technical,behavioral";

  return `You are an expert recruitment assistant.
Analyze the document and extract interview questions.

Job Role: ${jobPosition}
Job Description: ${jobDescription}
Categories: ${typesString}

Document:
---
${fileText}
---

Rules:
1. Identify all valid interview questions.
2. Assign each a "type" from: ${typesString}.
3. Exclude duplicates or irrelevant content.
4. Respond ONLY with JSON in this format:

{
  "questions": [
    { "question": "string", "type": "string" }
  ]
}
`;
}
