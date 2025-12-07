import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { interviewSession } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuid } from "uuid";

export const runtime = "nodejs";

// POST /api/interview/[id]/answers
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Required for Next 15+
    const { id } = await context.params;

    const interviewId = id;

    // ⭐ NOW we also read unblurCount
    const { candidateId, answers, unblurCount } = await req.json();

    if (!interviewId || !candidateId || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check existing session
    const existing = await db
         .select()
         .from(interviewSession)
         .where(
           and(
             eq(interviewSession.interviewId, interviewId),
             eq(interviewSession.candidateId, candidateId)
           )
         );

    let saved;

    if (existing.length > 0) {
      const prev = existing[0];

      // ⭐ Update: Save unblurCount safely
      saved = await db
        .update(interviewSession)
        .set({
          answers,
          unblurCount: unblurCount ?? prev.unblurCount ?? 0,
        })
        .where(eq(interviewSession.candidateId, candidateId))
        .returning();
    } else {
      // ⭐ Insert new record with unblurCount
      saved = await db
        .insert(interviewSession)
        .values({
          id: uuid(),
          interviewId,
          candidateId,
          answers,
          unblurCount: unblurCount ?? 0,
        })
        .returning();
    }

    return NextResponse.json(saved[0]);
  } catch (err) {
    console.error("save-answer POST error:", err);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
