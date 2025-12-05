import { NextResponse } from "next/server";
import { db } from "@/db";
import { booking } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const interviewId = searchParams.get("interview_id");

  if (!interviewId)
    return NextResponse.json({ error: "missing_interview_id" }, { status: 400 });

  const record = (
    await db.select().from(booking).where(eq(booking.interviewId, interviewId))
  )[0];

  if (!record)
    return NextResponse.json({ error: "not_found" }, { status: 404 });

  return NextResponse.json({
  ...record,
  start: record.start ? new Date(record.start).toISOString() : null,
  end: record.end ? new Date(record.end).toISOString() : null,
});

}