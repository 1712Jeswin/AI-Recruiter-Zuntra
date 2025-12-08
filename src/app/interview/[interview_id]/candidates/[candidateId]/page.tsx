import { db } from "@/db";
import { candidate, interviewSession } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

// ⚠️ FIX: Do NOT wrap params in a Promise.
// Turbopack requires this EXACT signature.
export default async function CandidateFeedbackPage({
  params,
}: {
  params: Promise<{ interview_id: string; candidateId: string }>;
}) {
  const { interview_id, candidateId } = await params;

  console.log("Interview:", interview_id);
  console.log("Candidate:", candidateId);


  console.log("Interview:", interview_id);
  console.log("Candidate:", candidateId);

  // Fetch candidate
  const cand = await db
    .select()
    .from(candidate)
    .where(eq(candidate.id, candidateId));

  if (!cand.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-xl shadow-md border border-red-100 text-center">
          <p className="text-red-500 font-medium">Candidate not found.</p>
        </div>
      </div>
    );
  }

  // Fetch evaluation JSON
  const session = await db
    .select()
    .from(interviewSession)
    .where(eq(interviewSession.candidateId, candidateId));

  if (!session.length || !session[0].evaluation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200 text-center">
          <p className="text-slate-500">No evaluation available for this candidate.</p>
        </div>
      </div>
    );
  }

  const evaluation: any = session[0].evaluation;
  const isRecommended = evaluation?.recommendation?.isRecommended;

  // Style helpers
  const getScoreStyles = (score: number) => {
    if (score >= 4) {
      return {
        text: "text-emerald-600",
        bg: "bg-emerald-500",
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    }
    if (score >= 2.5) {
      return {
        text: "text-amber-600",
        bg: "bg-amber-500",
        badge: "bg-amber-50 text-amber-700 border-amber-200",
      };
    }
    return {
      text: "text-red-600",
      bg: "bg-red-500",
      badge: "bg-red-50 text-red-700 border-red-200",
    };
  };

  const ScoreBar = ({ score }: { score: number }) => {
    const percent = Math.min((score / 5) * 100, 100);
    const w = `w-[${Math.round(percent)}%]`;
    const style = getScoreStyles(score);
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
          <span>Section Health</span>
          <span>{percent.toFixed(0)}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${style.bg} ${w}`} />
        </div>
      </div>
    );
  };

  const InsightItem = ({
    type,
    text,
  }: {
    type: "positive" | "negative" | "neutral";
    text: string;
  }) => {
    const Icon =
      type === "positive"
        ? CheckCircle2
        : type === "negative"
        ? XCircle
        : AlertCircle;

    return (
      <li className="flex gap-2 items-start">
        <Icon className="w-4 h-4 mt-0.5" />
        <span className="text-sm text-slate-700">{text}</span>
      </li>
    );
  };

  const TextToList = ({
    text,
    type,
  }: {
    text: string;
    type: "positive" | "negative" | "neutral";
  }) => {
    if (!text) return null;

    const list = text
      .split(/\. |\n/g)
      .filter((x) => x.trim().length > 3)
      .slice(0, 3);

    return (
      <ul className="space-y-1">
        {list.map((item, i) => (
          <InsightItem key={i} type={type} text={item} />
        ))}
      </ul>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* HEADER */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded">
              AI Evaluation
            </span>
            <span className="text-slate-500 text-xs">/ Feedback Report</span>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            Candidate: {candidateId.slice(0, 8)}
          </div>
        </div>
      </div>

      {/* MAIN */}
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Candidate Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{cand[0].fullName}</h1>
            <p className="text-slate-500 text-sm">{cand[0].email}</p>
          </div>

          <span
            className={`px-3 py-1.5 rounded text-xs font-bold border ${
              isRecommended
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {isRecommended ? "RECOMMENDED" : "NOT RECOMMENDED"}
          </span>
        </div>

        {/* Summary */}
        <div className="bg-white p-5 rounded-lg shadow border">
          <h2 className="font-bold mb-2 text-lg">Executive Summary</h2>
          <p className="text-slate-700 leading-relaxed">
            {evaluation.summary}
          </p>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(evaluation.breakdown || {}).map(([key, value]: any) => {
            const style = getScoreStyles(value.score);

            return (
              <div
                key={key}
                className="bg-white p-5 rounded-lg border shadow space-y-4"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-bold capitalize text-slate-800">
                    {key.replace(/_/g, " ")}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded border ${style.badge}`}>
                    {value.score}/5
                  </span>
                </div>

                <ScoreBar score={value.score} />

                <div>
                  <h4 className="text-sm font-bold text-emerald-600 mb-1">
                    Strengths
                  </h4>
                  <TextToList text={value.feedback} type="positive" />
                </div>

                <div>
                  <h4 className="text-sm font-bold text-red-600 mb-1">
                    Weaknesses
                  </h4>
                  <TextToList text={value.feedback} type="negative" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Combined Insights */}
        <div className="bg-white p-5 rounded-lg shadow border space-y-4">
          <h2 className="font-bold text-lg">Overall Assessment</h2>

          <div>
            <h3 className="font-bold text-emerald-700 mb-1">Key Strengths</h3>
            <TextToList
              text={evaluation.combinedAnswerInsights?.strengths}
              type="positive"
            />
          </div>

          <div>
            <h3 className="font-bold text-red-600 mb-1">Areas for Improvement</h3>
            <TextToList
              text={evaluation.combinedAnswerInsights?.weaknesses}
              type="negative"
            />
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-1">
              Behavioral Patterns
            </h3>
            <p className="text-slate-700">
              {evaluation.combinedAnswerInsights?.overallPatterns}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
