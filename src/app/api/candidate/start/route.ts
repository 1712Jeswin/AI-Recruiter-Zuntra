// /app/api/candidate/start/route.ts

import { NextResponse } from "next/server";
import { db } from "@/db";
import { candidate, emailVerification } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import { sendOtpEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { fullName, email, interviewId } = await req.json();

    if (!fullName || !email || !interviewId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Normalize inputs
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedInterviewId = String(interviewId).trim();

    // -----------------------------
    // 1️⃣ Check if candidate ALREADY EXISTS
    // -----------------------------
    // ❗ Do NOT block – allow login flow to proceed
    const existingCandidate = await db
      .select()
      .from(candidate)
      .where(
        and(
          eq(candidate.email, normalizedEmail),
          eq(candidate.interviewId, normalizedInterviewId)
        )
      );

    // Optional: You can auto-fill fullName from DB if needed
    if (existingCandidate.length > 0) {
      console.log("Candidate exists → login mode");
    }

    // -----------------------------
    // 2️⃣ Generate OTP
    // -----------------------------
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const id = randomUUID();

    // -----------------------------
    // 3️⃣ Insert or update OTP record
    // -----------------------------
    await db
      .insert(emailVerification)
      .values({
        id,
        email: normalizedEmail,
        interviewId: normalizedInterviewId,
        otp,
        expiresAt,
        verified: false,
      })
      .onConflictDoUpdate({
        target: [emailVerification.email, emailVerification.interviewId],
        set: {
          otp,
          expiresAt,
          verified: false,
        },
      });

    // -----------------------------
    // 4️⃣ Send OTP Email
    // -----------------------------
    try {
      await sendOtpEmail(normalizedEmail, otp);
    } catch (err) {
      console.error("Email Sending Failed:", err);
      return NextResponse.json(
        { error: "Failed to send OTP email. Try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      verificationId: id,
      message: "OTP sent successfully.",
    });

  } catch (err) {
    console.error("Start Verification Error:", err);

    return NextResponse.json(
      { error: "Failed to start email verification." },
      { status: 500 }
    );
  }
}
