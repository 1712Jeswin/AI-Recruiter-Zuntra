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

    // 1️⃣ Check duplicate candidate
    const exists = await db
      .select()
      .from(candidate)
      .where(
        and(eq(candidate.email, email), eq(candidate.interviewId, interviewId))
      );

    if (exists.length > 0) {
      return NextResponse.json(
        {
          error:
            "This email is already registered for this interview. Please continue or use a different email.",
        },
        { status: 409 }
      );
    }

    // 2️⃣ Generate OTP (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

    const id = randomUUID();

    // 3️⃣ Insert/Update verification record
    await db
      .insert(emailVerification)
      .values({
        id,
        email,
        interviewId,
        otp,
        expiresAt,
      })
      .onConflictDoUpdate({
        target: [emailVerification.email, emailVerification.interviewId],
        set: { otp, expiresAt, verified: false },
      });

    // 4️⃣ Send OTP email
    try {
      await sendOtpEmail(email, otp);
    } catch (emailErr) {
      console.error("Email sending failed:", emailErr);

      return NextResponse.json(
        {
          error:
            "Failed to send OTP email. Please try again or check email configuration.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      verificationId: id,
      message: "OTP sent to email.",
    });
  } catch (err) {
    console.error("Start verification error:", err);

    return NextResponse.json(
      { error: "Failed to start email verification." },
      { status: 500 }
    );
  }
}
