// app/interviews/[id]/page.tsx
import React from "react";
import { getInterviewDetails } from "./actions";
import { Card } from "@/components/ui/card";
import InterviewLeaderboardClient from "../../_components/InterviewLeaderboard.client";


/**
 * Types — placed here as you requested (Option 3)
 */
export type Interview = {
  id: string;
  userId: string;
  createdAt: Date | string;
  jobPosition: string | null;
  jobDescription: string | null;
  duration: string | null;
  type: string[] | null;
  experienceLevel: string | null;
  questionList: any | null;
  resumeScore: number | null;
  userEmail: string | null;
};

export type LeaderboardCandidate = {
  id: string;
  fullName: string;
  email: string;
  atsScore: number;
};

/**
 * Server component
 */
type PageProps = {
  params: { id: string };
};

export default async function InterviewDetails({ params }: PageProps) {
  const interviewId = params.id;

  // keep exact same semantics as your original reference
  const { interview, candidates } = await getInterviewDetails(interviewId);

  if (!interview) {
    return <div className="p-10 text-center text-red-500">Interview not found.</div>;
  }

  // Normalize / JSON-serializable candidates for client component.
  // Expectation: your getInterviewDetails SHOULD return candidates with atsScore (e.g., joined from feedback).
  const safeCandidates: LeaderboardCandidate[] = (candidates || []).map((c: any) => ({
    id: String(c.id),
    fullName: String(c.fullName ?? ""),
    email: String(c.email ?? ""),
    atsScore: Number(c.atsScore ?? 0),
  }));

  // Normalize interview fields if needed for display (avoid passing Dates)
  const safeInterview: Interview = {
    id: String(interview.id),
    userId: String(interview.userId ?? ""),
    createdAt: interview.createdAt ? String(interview.createdAt) : "",
    jobPosition: interview.jobPosition ?? "",
    jobDescription: interview.jobDescription ?? "",
    duration: interview.duration ?? null,
    type: interview.type ?? null,
    experienceLevel: interview.experienceLevel ?? null,
    questionList: interview.questionList ?? null,
    resumeScore: interview.resumeScore ?? 0,
    userEmail: interview.userEmail ?? null,
  };

  return (
    <div className="p-7">
      <h1 className="text-2xl font-semibold mb-4">
        {safeInterview.jobPosition} – Candidate Leaderboard
      </h1>

      <p className="text-gray-600 mb-6">
        Minimum ATS Score Required: <b>{safeInterview.resumeScore}</b>
      </p>

      <Card className="p-5 mb-6">
        <div className="text-sm text-slate-600">
          Interview ID: <span className="font-medium text-slate-800">{safeInterview.id ?? interviewId}</span>
          <span className="mx-2">•</span>
          Created: <span className="font-medium text-slate-800">{safeInterview.createdAt ?? "—"}</span>
        </div>
      </Card>

      {/* Client-side UI — pass down interview & safe candidates */}
      <InterviewLeaderboardClient interview={safeInterview} candidates={safeCandidates} />
    </div>
  );
}
