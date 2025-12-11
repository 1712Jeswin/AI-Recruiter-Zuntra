export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/db";
import { feedback, resumeQuestions } from "@/db/schema";
import { randomUUID } from "crypto";
import { VertexAI } from "@google-cloud/vertexai";
import PDFParser from "pdf2json";

// ------------ ENV VALIDATION ------------
if (!process.env.GCP_PROJECT_ID) {
  throw new Error("Missing GCP_PROJECT_ID");
}
if (!process.env.GOOGLE_SERVICE_ACCOUNT_BASE64) {
  throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_BASE64");
}

// ------------ LOAD BASE64 CREDENTIALS ------------
function loadCredentials() {
  const json = Buffer.from(
    process.env.GOOGLE_SERVICE_ACCOUNT_BASE64!,
    "base64"
  ).toString("utf8");

  return JSON.parse(json);
}

// ------------ CREATE WORKING VERTEX CLIENT ------------
function createVertexClient() {
  return new VertexAI({
    project: process.env.GCP_PROJECT_ID!,
    location: "us-central1",
    googleAuthOptions: {
      credentials: loadCredentials(),
    },
  });
}

// ------------ SAFE PDF to TEXT ------------
async function extractPdfText(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", (err: any) =>
      reject(err?.parserError ?? err)
    );

    pdfParser.on("pdfParser_dataReady", (data: any) => {
      let text = "";

      const safeDecode = (str: string) => {
        try {
          if (/%[0-9A-Fa-f]{2}/.test(str)) {
            return decodeURIComponent(str);
          }
        } catch {
          return str;
        }
        return str;
      };

      data.Pages.forEach((page: any) => {
        page.Texts.forEach((t: any) => {
          t.R.forEach((r: any) => {
            text += safeDecode(r.T) + " ";
          });
        });
      });

      resolve(text.trim());
    });

    pdfParser.parseBuffer(buffer);
  });
}

// ------------ CLEAN JSON OUTPUT ------------
function cleanJSON(str: string) {
  return str
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .replace(/\n/g, " ")
    .trim();
}

// ====================================================================
//                            MAIN HANDLER
// ====================================================================

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const interviewId = form.get("interviewId") as string | null;
    const candidateIdRaw = form.get("candidateId") as string | null;
    const file = form.get("resume") as File | null;

    const candidateId = candidateIdRaw?.trim();

    if (!candidateId)
      return NextResponse.json({ error: "Missing candidateId" }, { status: 400 });

    if (!interviewId)
      return NextResponse.json({ error: "Missing interviewId" }, { status: 400 });

    if (!file)
      return NextResponse.json({ error: "Resume file missing" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    let resumeText = await extractPdfText(buffer);

    if (!resumeText || resumeText.length < 10) {
      resumeText = "Resume parsing failed or text is empty.";
    }

    const job = await db.query.interview.findFirst({
      where: (i, { eq }) => eq(i.id, interviewId),
    });

    if (!job) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    // ------------ AI PROMPT (UNCHANGED) ------------
    const prompt = `
You are an expert resume evaluator and technical interviewer.

Return ONLY valid JSON in the EXACT STRUCTURE below:

{
  "evaluation": {
    "overallScore": 0.0,
    "toneStyle": { "score": 0.0, "strengths": [], "improvements": [] },
    "content": { "score": 0.0, "strengths": [], "improvements": [] },
    "structure": { "score": 0.0, "strengths": [], "improvements": [] },
    "skills": { "score": 0.0, "strengths": [], "improvements": [] },
    "ats": { "score": 0.0, "recommendedKeywords": [] }
  },
  "questions": [
    { "question": "" }
  ]
}

Rules:
- ONLY JSON. No markdown. No explanations.
- evaluation = exactly the structure above.
- questions MUST be EXACTLY 5.
- Each must be: { "question": "..." }

Job Description:
${job.jobDescription}

Resume:
${resumeText}
`;

    // ------------ USE WORKING VERTEX CLIENT ------------
    const vertex = createVertexClient();

    const model = vertex.getGenerativeModel({
      model: "models/gemini-2.0-flash", // ✅ SAME MODEL AS generate-questions
    });

    const aiResult = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    let raw = cleanJSON(
      aiResult.response?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}"
    );

    let parsed: any = {};
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.log("JSON Parse Error:", raw);
      return NextResponse.json(
        { error: "Gemini returned invalid JSON", raw },
        { status: 500 }
      );
    }

    const json = parsed.evaluation;
    const parsedQuestions = Array.isArray(parsed.questions)
      ? parsed.questions
      : [];

    await db.insert(resumeQuestions).values({
      id: randomUUID(),
      candidateId: candidateId!,
      interviewId: interviewId!,
      questions: parsedQuestions,
    });

    const scale = (n: number) => Math.round(Number(n) * 100);

    const feedbackId = randomUUID();

    await db.insert(feedback).values({
      id: feedbackId,
      candidateId: candidateId!,
      interviewId: interviewId!,
      overallScore: scale(json.overallScore),
      toneStyleScore: scale(json.toneStyle.score),
      contentScore: scale(json.content.score),
      structureScore: scale(json.structure.score),
      skillsScore: scale(json.skills.score),
      atsScore: scale(json.ats.score ?? 0),
      fullReport: json,
    });

    return NextResponse.json({
      success: true,
      feedbackId,
    });

  } catch (err) {
    console.log("Resume API Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
