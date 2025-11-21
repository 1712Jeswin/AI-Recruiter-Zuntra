export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/db";
import { feedback, interview, resumeQuestions } from "@/db/schema";
import { randomUUID } from "crypto";
import { VertexAI } from "@google-cloud/vertexai";
import PDFParser from "pdf2json";

// ---------------------------
// PDF → TEXT Extractor
// ---------------------------
async function extractPdfText(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", (err: any) => {
      reject(err?.parserError ?? err);
    });

    pdfParser.on("pdfParser_dataReady", (data: any) => {
      let text = "";
      data.Pages.forEach((page: any) => {
        page.Texts.forEach((t: any) => {
          t.R.forEach((r: any) => {
            text += decodeURIComponent(r.T) + " ";
          });
        });
      });
      resolve(text);
    });

    pdfParser.parseBuffer(buffer);
  });
}

// ---------------------------
// MAIN POST HANDLER
// ---------------------------
export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const interviewId = form.get("interviewId") as string | null;
    const candidateIdRaw = form.get("candidateId") as string | null;
    const file = form.get("resume") as File | null;

    console.log("Received:", {
      interviewId,
      candidateId: candidateIdRaw,
      file: file?.name,
    });

    // Clean & validate candidateId
    const candidateId = candidateIdRaw?.trim();
    if (!candidateId || candidateId === "undefined") {
      return NextResponse.json(
        { error: "Invalid or missing candidateId" },
        { status: 400 }
      );
    }

    if (!interviewId) {
      return NextResponse.json(
        { error: "interviewId missing" },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { error: "Resume file is required" },
        { status: 400 }
      );
    }

    // ---------------------------
    // Extract resume text
    // ---------------------------
    const buffer = Buffer.from(await file.arrayBuffer());
    const resumeText = await extractPdfText(buffer);

    // ---------------------------
    // Fetch interview/job data
    // ---------------------------
    const job = await db.query.interview.findFirst({
      where: (i, { eq }) => eq(i.id, interviewId),
    });

    if (!job) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    // ---------------------------
    // Gemini Resume Evaluation Prompt
    // ---------------------------
    const prompt = `
Return ONLY valid JSON. No markdown.

{
  "overallScore": number,
  "toneStyle": { "score": number, "strengths": [], "improvements": [] },
  "content": { "score": number, "strengths": [], "improvements": [] },
  "structure": { "score": number, "strengths": [], "improvements": [] },
  "skills": { "score": number, "strengths": [], "improvements": [] },
  "ats": { "score": number, "recommendedKeywords": [] }
}

Job Title: ${job.jobPosition}
Job Description: ${job.jobDescription}

Candidate Resume:
${resumeText}
`;

    const vertex = new VertexAI({
      project: process.env.GCP_PROJECT_ID!,
      location: "us-central1",
    });

    const model = vertex.getGenerativeModel({
      model: "models/gemini-2.0-flash",
    });

    const aiResult = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const raw = aiResult.response?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!raw) {
      return NextResponse.json(
        { error: "Gemini returned empty response" },
        { status: 500 }
      );
    }

    const cleaned = raw
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let json;
    try {
      json = JSON.parse(cleaned);
    } catch (err) {
      console.error("JSON Parse Error:", cleaned);
      return NextResponse.json(
        { error: "Invalid JSON returned by Gemini", raw: cleaned },
        { status: 500 }
      );
    }

    // ---------------------------
    // Generate 5 interview questions
    // ---------------------------
    const questionPrompt = `
Generate EXACTLY 5 interview questions based ONLY on this candidate's resume.
Return ONLY JSON array:

[
  "question1",
  "question2",
  "question3",
  "question4",
  "question5"
]

Resume:
${resumeText}
`;

    const questionResult = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: questionPrompt }] }],
    });

    let questionRaw =
      questionResult.response?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    questionRaw = questionRaw
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let parsedQuestions: string[] = [];

    try {
      parsedQuestions = JSON.parse(questionRaw);
    } catch (err) {
      console.error("Question JSON Parse Error:", questionRaw);
      parsedQuestions = [];
    }

    // Save questions in DB
    await db.insert(resumeQuestions).values({
      id: randomUUID(),
      candidateId,
      interviewId,
      questions: parsedQuestions,
    });

    // ---------------------------
    // Convert score floats → percentages
    // ---------------------------
    const toInt = (n: number) => Math.round(n * 100);

    const scores = {
      overallScore: toInt(json.overallScore),
      toneStyleScore: toInt(json.toneStyle.score),
      contentScore: toInt(json.content.score),
      structureScore: toInt(json.structure.score),
      skillsScore: toInt(json.skills.score),
      atsScore: toInt(json.ats.score ?? 0),
    };

    // ---------------------------
    // Save Feedback into DB
    // ---------------------------
    const feedbackId = randomUUID();

    await db.insert(feedback).values({
      id: feedbackId,
      candidateId,
      interviewId,
      ...scores,
      fullReport: json,
    });

    return NextResponse.json({
      success: true,
      feedbackId,
      scores,
    });
  } catch (error: any) {
    console.error("Resume Analysis Error:", error);
    return NextResponse.json(
      { error: "Server error", details: String(error) },
      { status: 500 }
    );
  }
}
