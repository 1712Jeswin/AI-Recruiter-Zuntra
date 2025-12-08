"use server";

import { db } from "@/db";
import { candidate, interviewSession } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function getLeaderboard() {
  try {
    // Extract overallScore safely
    const scoreSql = sql<number>`
      COALESCE( ((${interviewSession.evaluation})::jsonb ->> 'overallScore')::int, 0 )
    `;

    const rows = await db
      .select({
        interviewId: interviewSession.interviewId,
        candidateId: interviewSession.candidateId,   // ⭐ REQUIRED
        candidateName: candidate.fullName,
        candidateEmail: candidate.email,
        overallScore: scoreSql,
      })
      .from(interviewSession)
      .leftJoin(
        candidate,
        eq(candidate.id, interviewSession.candidateId)
      )
      .orderBy(desc(scoreSql));

    console.log("🏆 Leaderboard Query Result:", rows);

    return rows;
  } catch (err) {
    console.error("🔥 Leaderboard Error:", err);
    return [];
  }
}
