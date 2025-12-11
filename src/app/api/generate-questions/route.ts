
export const runtime = "nodejs";


import { NextResponse } from "next/server";
import { VertexAI } from "@google-cloud/vertexai";
import mammoth from "mammoth";

/**
 * Required env:
 *  - GCP_PROJECT_ID
 *  - GOOGLE_APPLICATION_CREDENTIALS (absolute path to service account JSON)
 */

// const pdf = require("pdf-parse");

// ---------- ENV VALIDATION ----------
if (!process.env.GCP_PROJECT_ID) {
  throw new Error("Missing GCP_PROJECT_ID env var");
}
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  throw new Error("Missing GOOGLE_APPLICATION_CREDENTIALS env var");
}

// ---------- Vertex Client ----------
const vertex = new VertexAI({
  project: process.env.GCP_PROJECT_ID,
  location: "us-central1",
  googleAuthOptions: {
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  },
});

// Preferred model list
const PREFERRED_MODELS = [
  `projects/${process.env.GCP_PROJECT_ID}/locations/us-central1/publishers/google/models/gemini-2.0-flash`,
  `projects/${process.env.GCP_PROJECT_ID}/locations/us-central1/models/gemini-2.0-flash`,
  "models/gemini-2.0-flash",
  "google/gemini-2.0-flash",
];

// ---------- Resolve Model ----------
async function getAvailableModel() {
  let lastErr: any = null;
  for (const modelId of PREFERRED_MODELS) {
    try {
      const candidate = vertex.getGenerativeModel({
        model: modelId,
        generationConfig: { responseMimeType: "application/json" },
      });
      return candidate;
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr || new Error("No available Vertex model found");
}

// ---------- Main Handler ----------
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // -------------------- CASE A: multipart with file --------------------
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
      return NextResponse.json(normalizeToType2(aiResponse, interviewTypes));

    }

    // -------------------- CASE B: application/json --------------------
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
        Array.isArray(interviewType)
          ? (interviewType as string[])
          : [String(interviewType)],
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

// ====================================================================
//                        FILE TEXT EXTRACTION
// ====================================================================

async function extractTextFromFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const mime = file.type;

  // ---------- 1. PDF → Gemini ----------
  if (mime === "application/pdf") {
    return await extractUsingGemini(buffer, mime);
  }

  // ---------- 2. Image → Gemini ----------
  if (
    mime.startsWith("image/") &&
    (mime.endsWith("png") ||
      mime.endsWith("jpeg") ||
      mime.endsWith("jpg") ||
      mime.endsWith("webp"))
  ) {
    return await extractUsingGemini(buffer, mime);
  }

  // ---------- 3. DOCX → Mammoth ----------
  if (
    mime ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result?.value || "";
  }

  // ---------- 4. DOC → fallback ----------
  if (mime === "application/msword") {
    return buffer.toString("utf-8");
  }

  // ---------- 5. Other files → fallback ----------
  return buffer.toString("utf-8");
}

// ---------- Gemini Parser for PDF & Images ----------
async function extractUsingGemini(buffer: Buffer, mimeType: string) {
  const base64 = buffer.toString("base64");
  const model = await getAvailableModel();

  const prompt = `
Extract all readable text from this document or image.
Return ONLY plain text. No markdown. No code blocks.
Preserve logical reading order.
`;

  const result = await model.generateContent({
    contents: [
      { role: "user", parts: [{ text: prompt }] },
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64,
            },
          },
        ],
      },
    ],
  });

  return (
    result?.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ""
  );
}

// ====================================================================
//                        GENERATE QUESTIONS
// ====================================================================

async function generateAIContent(prompt: string) {
  try {
    const model = await getAvailableModel();

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const rawText =
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      console.error("Vertex raw result (unexpected shape):", JSON.stringify(result, null, 2));
      throw new Error("No text returned from Vertex model");
    }

    return JSON.parse(rawText);
  } catch (err) {
    console.error("Vertex Generation Error:", err);
    throw err;
  }
}

// ====================================================================
//                        NORMALIZER
// ====================================================================

// function normalizeToType2(aiResponse: any) {
//   const output: { questions: { question: string; type: string }[] } = {
//     questions: [],
//   };

//   if (!aiResponse || !aiResponse.questions) return output;

//   // Case: AI already returned an array [{question}]
//   if (Array.isArray(aiResponse.questions)) {
//    output.questions = aiResponse.questions
//   .filter((q: any) => q?.question)
//   .map((q: any) => ({
//     question: String(q.question).trim(),
//     type: String(q.type || "").trim(),
//   }));

//     return output;
//   }

//   // Fallback for object format
//   Object.entries(aiResponse.questions).forEach(([_, list]) => {
//     if (Array.isArray(list)) {
//       list.forEach((q) => {
//         if (q && typeof q === "string" && q.trim()) {
//           output.questions.push({ question: q.trim(), type: "" });
//         }
//       });
//     }
//   });

//   return output;
// }

function normalizeToType2(aiResponse: any, selectedTypes?: string[]) {
  const output: { questions: { question: string; type: string }[] } = {
    questions: [],
  };

  if (!aiResponse || !aiResponse.questions) return output;

  const singleType =
    Array.isArray(selectedTypes) && selectedTypes.length === 1
      ? selectedTypes[0]
      : "";

  // Case: AI already returned an array [{question}]
  if (Array.isArray(aiResponse.questions)) {
    output.questions = aiResponse.questions
      .filter((q: any) => q?.question)
      .map((q: any) => ({
        question: String(q.question).trim(),
        type: singleType ? singleType : String(q.type || "").trim(),
      }));

    return output;
  }

  // Fallback for object format
  Object.entries(aiResponse.questions).forEach(([_, list]) => {
    if (Array.isArray(list)) {
      list.forEach((q) => {
        if (q && typeof q === "string" && q.trim()) {
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


// ====================================================================
//                        PROMPT BUILDERS
// ====================================================================

function buildGenerationPrompt(
  jobPosition: string,
  jobDescription: string,
  interviewDuration: string,
  interviewType: string[],
  experienceLevel: string
): string {
  // If recruiter selects nothing, default to all 5
  const selectedTypes =
    interviewType.length > 0
      ? interviewType
      : ["Technical", "Behavioral", "Experience", "Problem Solving", "Leadership"];

  const typesString = selectedTypes.join(", ");

  const experienceGuidelines: Record<string, string> = {
    Junior:
      "Ask simple, fundamental, beginner-friendly questions that test understanding rather than deep expertise.",
    Mid: "Ask practical, scenario-based, debugging and applied knowledge questions.",
    Senior:
      "Ask deep, architectural, system-design, leadership, high-impact reasoning questions.",
  };

  const levelGuideline =
    experienceGuidelines[experienceLevel] || "Match questions to the experience level.";

  return `
You are an expert AI interview question generator.

Your task:
Generate **EXACTLY 30** interview questions.

Each question must have:
- "question": the question text
- "type": one of these → ${typesString}

Rules:
1. Generate questions ONLY from the selected types listed above.
2. The 30 questions MUST be evenly distributed across the selected types.
   Examples:
   - If 1 type selected → all 30 belong to that type.
   - If 2 types selected → ~15 per type.
   - If 3 types selected → ~10 per type.
   - If 4 types selected → ~7–8 per type.
   - If 5 types selected → ~6 per type.
3. Every question MUST be completely unique (no rephrased duplicates).
4. All questions must match:
   - Job Role: ${jobPosition}
   - Experience Level: ${experienceLevel}
   - Job Description responsibility & context
5. Apply the level-specific difficulty:
   ${levelGuideline}
6. Avoid generic or textbook-style questions.
7. Output must be ONLY valid JSON. No markdown. No commentary.

The required output structure is:

{
  "questions": [
    { "question": "string", "type": "string" }
  ]
}

--- Job Description ---
${jobDescription}
------------------------
`;
}

function buildReviewPrompt(
  fileText: string,
  jobPosition: string,
  jobDescription: string,
  interviewTypes: string[]
): string {
  return `
You are an expert recruitment assistant.
Extract ONLY the interview questions from the document.

Important:
- DO NOT assign any category or type.
- DO NOT attempt to classify questions.
- Return ONLY the detected questions.
- No commentary. No markdown.

Output format:
{
  "questions": [
    { "question": "string" }
  ]
}

Document content:
----------------
${fileText}
----------------

Extract as many valid interview questions as possible.
If sentences resemble questions but are not valid interview questions, ignore them.
`;
}