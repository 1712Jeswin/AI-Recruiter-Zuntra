import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { interviewSession } from "@/db/schema";
import { eq } from "drizzle-orm";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// ============ STRONG JSON CLEANER ============
function cleanJSON(raw: string) {
  return raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .replace(/^[^{]*({[\s\S]*})[^}]*$/m, "$1")
    .replace(/\n/g, " ")
    .replace(/\r/g, " ")
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const { candidateId, answers, unblurCount } = await req.json();

    if (!candidateId || !answers) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Construct prompt INCLUDING UNBLUR COUNT
    const prompt = `
You are an advanced AI interview evaluator. Analyze the candidate’s performance based on the voice answers.

IMPORTANT:
The candidate unblurred the question **${unblurCount} times**.
Unblurring means the candidate relied on reading instead of listening.
This should directly reduce their **listening skill score** and influence the communication evaluation.

Your job is to produce a deep, structured evaluation that captures:
- Communication ability
- **Listening skill penalty based on unblurCount**
- Clarity of thought
- Technical and analytical skill
- Professionalism
- Overall interview readiness

RULE FOR LISTENING SKILLS:

- If unblurCount = 0 → no penalty  
- If unblurCount = 1 → mild penalty  
- If unblurCount 2–3 → noticeable penalty  
- If unblurCount ≥ 4 → strong penalty, explicitly mention it in feedback  
- Incorporate this penalty into:
  - communication score  
  - professionalism feedback  
  - summary  
  - final verdict if necessary  

IMPORTANT — Return STRICT JSON ONLY.

FINAL JSON FORMAT:
{
  "overallScore": number,
  "verdict": string,
  "summary": string,
  "recommendation": {
    "isRecommended": boolean,
    "level": string,
    "reason": string
  },
  "breakdown": {
    "enthusiasm_interest": { "score": number, "feedback": string },
    "communication": { "score": number, "feedback": string },
    "self_awareness": { "score": number, "feedback": string },
    "technical_ability": { "score": number, "feedback": string },
    "professionalism": { "score": number, "feedback": string }
  },
  "combinedAnswerInsights": {
    "strengths": string,
    "weaknesses": string,
    "overallPatterns": string
  },
  "metadata": {
    "totalQuestions": number,
    "responsesReceived": number,
    "silenceAutoSubmits": number,
    "manualSkips": number,
    "unblurCount": number,
    "interviewDate": string
  }
}

Candidate Answers:
${JSON.stringify(answers, null, 2)}
`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);

    let text = result.response.text();
    let cleaned = cleanJSON(text);

    let parsed;

    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error("JSON parse error:", text);

      parsed = {
        summary: "Evaluation failed, fallback applied.",
        verdict: "Needs Improvement",
        overallScore: 50,
        metadata: { unblurCount }
      };
    }

    // Save to database
    await db
      .update(interviewSession)
      .set({
        evaluation: parsed,
        status: "completed"   // ← Mark interview as completed
      })
      .where(eq(interviewSession.candidateId, candidateId));


    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Evaluation API Error:", err);
    return NextResponse.json({ error: "Evaluation failed" }, { status: 500 });
  }
}
