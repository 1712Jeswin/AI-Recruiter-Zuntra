// /app/api/candidate/verify/route.ts

import { NextResponse } from "next/server";
import { db } from "@/db";
import { candidate, emailVerification } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const { fullName, email, interviewId, otp } = await req.json();

    if (!fullName || !email || !interviewId || !otp) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1️⃣ Fetch verification record
    const records = await db
      .select()
      .from(emailVerification)
      .where(
        and(
          eq(emailVerification.email, email),
          eq(emailVerification.interviewId, interviewId)
        )
      );

    if (records.length === 0) {
      return NextResponse.json({ error: "No verification found." }, { status: 404 });
    }

    const record = records[0];

    // 2️⃣ Wrong OTP
    if (record.otp !== otp) {
      return NextResponse.json({ error: "Invalid OTP." }, { status: 400 });
    }

    // 3️⃣ Expired
    if (new Date(record.expiresAt) < new Date()) {
      return NextResponse.json({ error: "OTP expired." }, { status: 400 });
    }

    // 4️⃣ Mark verified
    await db
      .update(emailVerification)
      .set({ verified: true })
      .where(eq(emailVerification.id, record.id));

    // 5️⃣ Create candidate
    const candidateId = randomUUID();

    await db.insert(candidate).values({
      id: candidateId,
      fullName,
      email,
      interviewId,
    });

    return NextResponse.json({
      success: true,
      candidateId,
    });
  } catch (err) {
    console.error("Verify error:", err);
    return NextResponse.json(
      { error: "Failed to verify OTP." },
      { status: 500 }
    );
  }
}
