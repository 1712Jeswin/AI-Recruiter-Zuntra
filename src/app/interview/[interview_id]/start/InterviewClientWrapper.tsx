"use client";

import InterviewPage from "./_components/InterviewPage";

interface InterviewClientWrapperProps {
  interviewId: string;
  candidateId: string;
}

export default function InterviewClientWrapper({
  interviewId,
  candidateId,
}: InterviewClientWrapperProps) {
  return (
    <InterviewPage interviewId={interviewId} candidateId={candidateId} />
  );
}
