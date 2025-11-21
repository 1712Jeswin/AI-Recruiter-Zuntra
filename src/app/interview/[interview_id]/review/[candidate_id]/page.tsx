"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function ResumeReviewPage() {
  const { interview_id, candidate_id } = useParams();
  const [feedback, setFeedback] = useState<any>(null);
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Load feedback
        const fbRes = await fetch(
          `/api/candidate/${candidate_id}/feedback`
        );
        const fbJson = await fbRes.json();
        setFeedback(fbJson);

        // Load candidate info
        const cRes = await fetch(`/api/candidate/${candidate_id}`);
        const cJson = await cRes.json();
        setCandidate(cJson);
      } catch (err) {
        console.log("Error loading review:", err);
      }
      setLoading(false);
    }

    load();
  }, [interview_id, candidate_id]);

  if (loading || !feedback || !candidate)
    return (
      <div className="h-screen flex flex-col justify-center items-center text-gray-700 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm text-blue-600">Loading your review…</p>
      </div>
    );

  const fb = feedback.fullReport;

  const Section = ({ title, data }: any) => (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <Progress value={data.score} className="w-full" />

        {/* Strengths */}
        <div>
          <p className="font-medium mb-1">Strengths</p>
          <ul className="space-y-1">
            {data.strengths?.map((s: any, i: number) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Improvements */}
        <div>
          <p className="font-medium mb-1">Improvements</p>
          <ul className="space-y-1">
            {data.improvements?.map((s: any, i: number) => (
              <li key={i} className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <Card className="w-full max-w-4xl shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Resume Review Summary
          </CardTitle>
          <p className="text-sm text-gray-500">
            Candidate:{" "}
            <span className="font-medium text-gray-700">
              {candidate.fullName}
            </span>
          </p>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* OVERALL SCORE */}
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">Overall Score</p>
            <Progress value={fb.overallScore} className="w-full" />
            <p className="mt-2 text-sm text-gray-600">
              {fb.overallScore}% match to job requirements
            </p>
          </div>

          {/* SECTIONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Section title="Tone & Style" data={fb.toneStyle} />
            <Section title="Content Quality" data={fb.content} />
            <Section title="Structure & Formatting" data={fb.structure} />
            <Section title="Skills Match" data={fb.skills} />
          </div>

          {/* ATS SECTION */}
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">ATS Compatibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <Progress value={fb.ats.score} className="w-full" />

              <div>
                <p className="font-medium mb-1">Recommendations</p>
                <ul className="space-y-1">
                  {fb.ats.recommendations?.map((r: any, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
