import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { interviewSession } from "@/db/schema";
import { eq, and } from "drizzle-orm";



export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const searchParams = req.nextUrl.searchParams;
  const candidateId = searchParams.get("candidateId");

  if (!candidateId) {
    return NextResponse.json(
      { error: "candidateId is required" },
      { status: 400 }
    );
  }

  const rows = await db
    .select()
    .from(interviewSession)
    .where(
      and(
        eq(interviewSession.interviewId, id),
        eq(interviewSession.candidateId, candidateId)
      )
    );

  const status = rows[0]?.status || "pending";

  return NextResponse.json({ status });
}
