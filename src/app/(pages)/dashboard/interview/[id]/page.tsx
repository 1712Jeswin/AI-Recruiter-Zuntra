
// app/interviews/[id]/page.tsx
import React from "react";
import { getInterviewDetails } from "./actions";
import { Card } from "@/components/ui/card";
import InterviewLeaderboardClient from "../../_components/InterviewLeaderboard.client";
// import CheatMonitorWrapper from "./_components/CheatMonitorWrapper";

/**
 * Types
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


export default async function InterviewDetails(
  props: { params: Promise<{ id: string }> }
) {
  const { id: interviewId } = await props.params;

  const { interview, candidates } = await getInterviewDetails(interviewId);

  if (!interview) {
    return (
      <div className="p-10 text-center text-red-500">Interview not found.</div>
    );
  }

  const safeCandidates: LeaderboardCandidate[] = (candidates || []).map(
    (c: any) => ({
      id: String(c.id),
      fullName: String(c.fullName ?? ""),
      email: String(c.email ?? ""),
      atsScore: Number(c.atsScore ?? 0),
    })
  );

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
      {/* <CheatMonitorWrapper /> */}
      <h1 className="text-2xl font-semibold mb-4">
        {safeInterview.jobPosition} – Candidate Leaderboard
      </h1>

      <p className="text-gray-600 mb-6">
        Minimum ATS Score Required: <b>{safeInterview.resumeScore}</b>
      </p>

      <Card className="p-5 mb-6">
        <div className="text-sm text-slate-600">
          Interview ID:{" "}
          <span className="font-medium text-slate-800">
            {safeInterview.id ?? interviewId}
          </span>
          <span className="mx-2">•</span>
          Created:{" "}
          <span className="font-medium text-slate-800">
            {String(safeInterview.createdAt) ?? "—"}
          </span>
        </div>
      </Card>

      <InterviewLeaderboardClient
        interview={safeInterview}
        candidates={safeCandidates}
      />
    </div>
  );
}
