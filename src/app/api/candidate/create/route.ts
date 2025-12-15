import { NextResponse } from "next/server";
import { db } from "@/db";
import { candidate } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const { fullName, email, interviewId } = await req.json();

    if (!fullName || !email || !interviewId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1️⃣ Check if candidate already exists for this interview
    const existing = await db.query.candidate.findFirst({
      where: and(eq(candidate.email, email), eq(candidate.interviewId, interviewId)),
    });

    if (existing) {
      return NextResponse.json(
        {
          success: true,
          existing: true,
          candidateId: existing.id,
          message: "Candidate already exists for this interview",
        },
        { status: 200 }
      );
    }

    // 2️⃣ Create new candidate
    const id = randomUUID();

    await db.insert(candidate).values({
      id,
      fullName,
      email,
      interviewId,
    });
    
  

    return NextResponse.json(
      {
        success: true,
        existing: false,
        candidateId: id,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Candidate creation error:", err);
    return NextResponse.json(
      { error: "Failed to create candidate" },
      { status: 500 }
    );
  }
}
