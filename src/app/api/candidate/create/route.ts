import { NextResponse } from "next/server";
import { db } from "@/db";
import { candidate } from "@/db/schema";
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

    const id = randomUUID();

    await db.insert(candidate).values({
      id,
      fullName,
      email,
      interviewId,
    });

    return NextResponse.json(
      { success: true, candidateId: id },
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
