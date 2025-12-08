"use server";

import { db } from "@/db";
import { interview, candidate, feedback } from "@/db/schema";
import { eq, and, gte } from "drizzle-orm";

export async function getInterviewDetails(interviewId: string) {
  // Fetch interview
  const interviewData = await db.query.interview.findFirst({
    where: eq(interview.id, interviewId)
  });

  if (!interviewData) return { interview: null, candidates: [] };

  // Fetch candidates + their ATS scores only where ATS >= resumeScore
  const candidatesWithScores = await db
    .select({
      id: candidate.id,
      fullName: candidate.fullName,
      email: candidate.email,
      atsScore: feedback.atsScore,
    })
    .from(candidate)
    .innerJoin(feedback, eq(candidate.id, feedback.candidateId))
    .where(
      and(
        eq(candidate.interviewId, interviewId),
        gte(feedback.atsScore, interviewData.resumeScore!)
      )
    )
    .orderBy(feedback.atsScore) // ASC by default
    .execute();

  return {
    interview: interviewData,
    candidates: candidatesWithScores
  };
}