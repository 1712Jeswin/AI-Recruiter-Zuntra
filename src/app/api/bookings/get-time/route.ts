import { NextResponse } from "next/server";
import { db } from "@/db";
import { booking } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const interviewId = searchParams.get("interview_id");

  if (!interviewId) {
    return NextResponse.json(
      { error: "missing_interview_id" },
      { status: 400 }
    );
  }

  const record = (
    await db
      .select()
      .from(booking)
      .where(eq(booking.interviewId, interviewId))
  )[0];

  if (!record) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // IMPORTANT:
  // record.start and record.end are already JS Date objects
  return NextResponse.json({
    id: record.id,
    interviewId: record.interviewId,
    candidateId: record.candidateId,
    slotId: record.slotId,
    slotIndex: record.slotIndex,
    status: record.status,
    meetingLink: record.meetingLink,

    start: record.start ? record.start.toISOString() : null,
    end: record.end ? record.end.toISOString() : null,

    createdAt: record.createdAt?.toISOString?.() ?? null,
    updatedAt: record.updatedAt?.toISOString?.() ?? null,
  });
}
