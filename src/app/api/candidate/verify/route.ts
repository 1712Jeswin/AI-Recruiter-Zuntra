// /app/api/candidate/verify/route.ts

import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  candidate,
  emailVerification,
  booking,
  interviewSession,
  interview,
  feedback
} from "@/db/schema";
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

    // Normalize inputs (THIS FIXES DUPLICATE CANDIDATE ISSUE)
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedInterviewId = String(interviewId).trim();

    // 1️⃣ Fetch verification record
    const records = await db
      .select()
      .from(emailVerification)
      .where(
        and(
          eq(emailVerification.email, normalizedEmail),
          eq(emailVerification.interviewId, normalizedInterviewId)
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

    // 3️⃣ Expired OTP
    if (new Date(record.expiresAt) < new Date()) {
      return NextResponse.json({ error: "OTP expired." }, { status: 400 });
    }

    // 4️⃣ Mark verified
    await db
      .update(emailVerification)
      .set({ verified: true })
      .where(eq(emailVerification.id, record.id));

    // 5️⃣ Check if candidate already exists — FIXED ✔
    const existingCandidate = await db
      .select()
      .from(candidate)
      .where(
        and(
          eq(candidate.email, normalizedEmail),
          eq(candidate.interviewId, normalizedInterviewId)
        )
      );

    let candidateId: string;

    if (existingCandidate.length > 0) {
      candidateId = existingCandidate[0].id; // REUSE existing
    } else {
      candidateId = randomUUID();
      await db.insert(candidate).values({
        id: candidateId,
        fullName,
        email: normalizedEmail,
        interviewId: normalizedInterviewId,
      });
    }

    // -------------------------------
    // ACCESS CONTROL RULES
    // -------------------------------

    // 1️⃣ Check confirmed booking
    const existingBooking = await db
      .select()
      .from(booking)
      .where(
        and(
          eq(booking.candidateId, candidateId),
          eq(booking.status, "confirmed")
        )
      );

    if (existingBooking.length > 0) {
      return NextResponse.json({
        success: true,
        candidateId,
        allowed: true,
        reason: "candidate_has_confirmed_booking"
      });
    }

    // 2️⃣ Check interview session
    const sessionRecord = await db
      .select()
      .from(interviewSession)
      .where(
        and(
          eq(interviewSession.candidateId, candidateId),
          eq(interviewSession.interviewId, normalizedInterviewId)
        )
      );

    if (sessionRecord.length > 0) {
      const session = sessionRecord[0];

      if (session.status === "completed") {
        return NextResponse.json(
          {
            success: true,
            allowed: false,
            reason: "interview_already_completed"
          },
          { status: 403 }
        );
      }

      // pending → allow
      return NextResponse.json({
        success: true,
        candidateId,
        allowed: true,
        reason: "pending_session"
      });
    }

    // 3️⃣ If no booking → check ATS vs Resume score

    // Resume score from interview table
    const interviewData = await db
      .select()
      .from(interview)
      .where(eq(interview.id, normalizedInterviewId));

    const resumeScore = interviewData[0]?.resumeScore ?? 0;

    // ATS score from feedback
    const feedbackData = await db
      .select()
      .from(feedback)
      .where(
        and(
          eq(feedback.candidateId, candidateId),
          eq(feedback.interviewId, normalizedInterviewId)
        )
      );

    // 🆕 Allow candidate if resume not uploaded yet
    // 🆕 Allow candidate if resume not uploaded yet
    if (feedbackData.length === 0) {
      return NextResponse.json({
        success: true,
        candidateId,
        allowed: true,
        reason: "resume_not_uploaded_yet"
      });
    }

    const atsScore = feedbackData[0]?.atsScore ?? 0;

    // 🛑 Strict rule: atsScore MUST be strictly greater than resumeScore
    if (atsScore >= resumeScore) {
      return NextResponse.json({
        success: true,
        candidateId,
        allowed: true,
        reason: "ats_score_higher_than_resume"
      });
    }

    // ❌ atsScore <= resumeScore → NOT eligible
    return NextResponse.json(
      {
        success: true,
        allowed: false,
        reason: "ats_not_higher_than_resume"
      },
      { status: 403 }
    );


  } catch (err) {
    console.error("Verify error:", err);
    return NextResponse.json(
      { error: "Failed to verify OTP." },
      { status: 500 }
    );
  }
}
