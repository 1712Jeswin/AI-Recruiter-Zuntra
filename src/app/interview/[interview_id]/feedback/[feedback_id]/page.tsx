"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  ShieldCheck,
  Wifi,
  Server,
  Code2,
  FileText,
  ChevronRight,
  BarChart3,
  Type,
  Layout,
  Award,
  XCircle,
} from "lucide-react";

/* -------------------------------------
   Design System (same as before)
--------------------------------------*/

const Card = ({ children, className = "" }: any) => (
  <div
    className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}
  >
    {children}
  </div>
);

const ProgressBar = ({ value, className = "" }: any) => {
  let colorClass = "bg-indigo-600";
  if (value >= 80) colorClass = "bg-emerald-500";
  else if (value < 50) colorClass = "bg-rose-500";
  else if (value < 70) colorClass = "bg-amber-500";

  return (
    <div
      className={`h-2.5 w-full bg-slate-100 rounded-full overflow-hidden ${className}`}
    >
      <div
        className={`h-full ${colorClass} transition-all duration-500 ease-out`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

const ScoreRing = ({ score, size = 160, strokeWidth = 10 }: any) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  let colorClass = "text-indigo-600";
  if (score >= 80) colorClass = "text-emerald-500";
  else if (score < 50) colorClass = "text-rose-500";
  else if (score < 70) colorClass = "text-amber-500";

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-slate-100"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={`${colorClass} transition-all duration-1000 ease-out`}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-slate-800">{score}</span>
        <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
          Overall
        </span>
      </div>
    </div>
  );
};

const SectionCard = ({ title, icon: Icon, data, score }: any) => {
  const displayData = { ...data, score };
  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-600 shadow-sm">
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-800">{title}</h3>
        </div>
        <span className="text-sm font-bold text-slate-700">{score}/100</span>
      </div>

      <div className="p-5 flex-1 space-y-6">
        <div>
          <div className="flex justify-between text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">
            <span>Section Health</span>
            <span>{score}%</span>
          </div>
          <ProgressBar value={score} />
        </div>

        <div className="space-y-4">
          {displayData.strengths?.length > 0 ? (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Strengths
              </h4>
              <ul className="space-y-2.5">
                {displayData.strengths.map((s: any, i: number) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-sm text-slate-600"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {displayData.improvements?.length > 0 ? (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Needs Improvement
              </h4>
              <ul className="space-y-2.5">
                {displayData.improvements.map((s: any, i: number) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-sm text-slate-600"
                  >
                    <XCircle className="w-4 h-4 text-rose-500 mt-0.5" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
};

/* ----------------------------- Loader ------------------------------*/

function TechLoader({ active }: any) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!active) return setActiveStep(0);
    const interval = setInterval(() => {
      setActiveStep((p) => (p < 4 ? p + 1 : p));
    }, 700);
    return () => clearInterval(interval);
  }, [active]);

  const items = [
    { icon: Wifi, text: "Analyzing resume…" },
    { icon: ShieldCheck, text: "Scanning tone & writing style…" },
    { icon: Server, text: "Extracting skills & structures…" },
    { icon: Code2, text: "Running ATS compatibility engine…" },
  ];

  return (
    <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-mono text-slate-500 uppercase tracking-widest font-semibold">
          Resume Analysis System
        </span>
      </div>

      <div className="space-y-5">
        {items.map((item, index) => {
          const Icon = item.icon;
          const isComplete = activeStep > index;
          const isCurrent = activeStep === index;

          return (
            <div key={index} className="flex items-center gap-4 transition-all">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center 
                  ${isComplete
                    ? "bg-emerald-50 text-emerald-600"
                    : isCurrent
                      ? "bg-indigo-50 text-indigo-600 scale-110"
                      : "bg-slate-50 text-slate-300"
                  }`}
              >
                {isComplete ? <CheckCircle2 size={18} /> : <Icon size={18} />}
              </div>
              <span
                className={`text-sm font-mono ${isCurrent ? "text-slate-800 font-bold" : "text-slate-500"
                  }`}
              >
                {item.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ----------------------------- Main Page ------------------------------*/

export default function FeedbackPage() {
  const router = useRouter();
  const { interview_id, feedback_id } = useParams();

  const [data, setData] = useState<any>(null);
  const [interview, setInterview] = useState<any>(null);
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /* ------------ Load feedback ------------ */
  useEffect(() => {
    async function loadFeedback() {
      try {
        const res = await fetch(`/api/feedback/${feedback_id}`);
        setData(await res.json());
      } catch {
        setData({ error: "Fetch failed" });
      }
    }
    loadFeedback();
  }, [feedback_id]);

  /* ------------ Load interview ------------ */
  useEffect(() => {
    async function loadInterview() {
      try {
        const res = await fetch(`/api/interview/${interview_id}`);
        setInterview(await res.json());
      } finally {
        setLoading(false);
      }
    }
    loadInterview();
  }, [interview_id]);

  /* ------------ Load candidate FROM FEEDBACK (CORRECT!) ------------ */
  useEffect(() => {
    if (!data?.candidateId) return;

    async function loadCandidate() {
      try {
        const res = await fetch(`/api/candidate/${data.candidateId}`);
        const json = await res.json();
        setCandidate(json);
      } catch (err) {
        console.error("Failed to load candidate", err);
      }
    }
    loadCandidate();
  }, [data]);

  /* ------------ Loader ------------ */
  if (loading || !data || !interview || !candidate) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <TechLoader active={true} />
      </div>
    );
  }

  /* ------------ Error ------------ */
  if (data.error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="p-10 text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Feedback Not Found
          </h2>
          <p className="text-slate-500">
            We couldn't retrieve the analysis for this session.
          </p>
        </Card>
      </div>
    );
  }

  /* ------------ Normalize Scores ------------ */
  const normalize = (v: any) => (!v ? 0 : v > 1 ? v : Math.round(v * 100));

  const report = data.fullReport || {};

  const overall = normalize(data.overallScore ?? report.overallScore);
  const tone = normalize(data.toneStyleScore ?? report.toneStyle?.score);
  const content = normalize(data.contentScore ?? report.content?.score);
  const structure = normalize(data.structureScore ?? report.structure?.score);
  const skills = normalize(data.skillsScore ?? report.skills?.score);
  const ats = normalize(data.atsScore ?? report.ats?.score);

  const cutoff = interview.resumeScore ?? 0;
  const didPass = ats >= cutoff;

  /* ------------------------  UI ------------------------*/
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <h1 className="font-bold text-lg text-slate-800">
              Resume Analysis
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-xl font-medium text-slate-800">
                {candidate?.fullName || "Candidate"}
              </p>
              <p className="text-xs text-slate-500">{interview.title}</p>
            </div>

            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
              {candidate?.fullName?.charAt(0)?.toUpperCase() || "C"}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* LEFT: SCORE */}
          <Card className="p-6 flex flex-col items-center">
            <h2 className="text-lg font-semibold text-slate-700 mb-6 w-full text-center">
              Match Score
            </h2>

            <ScoreRing score={overall} />

            <div className="mt-6 w-full text-center">
              {didPass ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
                  <p className="text-emerald-700 font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 size={18} /> Screening Passed
                  </p>
                  <p className="text-xs text-emerald-600">
                    ATS Score met the {cutoff}% cutoff.
                  </p>
                </div>
              ) : (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 mb-4">
                  <p className="text-rose-700 font-bold flex items-center justify-center gap-2">
                    <XCircle size={18} /> Cutoff Missed
                  </p>
                  <p className="text-xs text-rose-600">
                    ATS Score above {cutoff}% required.
                  </p>
                </div>
              )}
            </div>

            <button
              disabled={!didPass}
              onClick={() => router.push(`/interview/${interview_id}/slot`)}
              className={`
    w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2
    transition-all duration-200

    ${didPass
                  ? `
          bg-blue-600 text-white border border-blue-600
          hover:bg-blue-700 hover:border-blue-700
        `
                  : `
          bg-white text-blue-400 border border-blue-300
          cursor-not-allowed
        `
                }
  `}
            >
              Start Interview <ChevronRight size={16} />
            </button>


          </Card>

          {/* RIGHT: ATS + Quick Stats */}
          <div className="lg:col-span-2 grid grid-cols-1 gap-6">
            {/* ATS Card */}
            {/* <div className="bg-slate-800 text-white p-6 rounded-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>

              <div className="relative">
                <div className="flex justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                      <Code2 className="w-6 h-6 text-indigo-200" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">ATS Compatibility</h3>
                      <p className="text-xs text-slate-400">
                        Automated Tracking Check
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-4xl font-bold">{ats}%</span>
                    <p className="text-xs text-slate-400">Cutoff: {cutoff}%</p>
                  </div>
                </div>

                <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">
                  Missing Keywords
                </p>

                <div className="flex flex-wrap gap-2">
                  {(report.ats?.recommendedKeywords || []).map(
                    (k: string, i: number) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-white/10 rounded-full text-sm text-indigo-100 border border-white/10"
                      >
                        {k}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div> */}

            <div className="bg-white text-slate-800 p-6 rounded-xl border border-slate-200 relative overflow-hidden shadow-sm">
              <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-100 opacity-20 rounded-full blur-3xl"></div>

              <div className="relative">
                <div className="flex justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-100 rounded-xl">
                      <Code2 className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-700">
                        ATS Compatibility
                      </h3>
                      <p className="text-xs text-slate-500">
                        Automated Tracking Check
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-4xl font-bold ${ats >= cutoff ? "text-emerald-600" : "text-red-500"
                        }`}
                    >
                      {ats}%
                    </span>
                    <p className="text-xs text-slate-500">Cutoff: {cutoff}%</p>
                  </div>
                </div>

                <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">
                  Missing Keywords
                </p>

                <div className="flex flex-wrap gap-2">
                  {(report.ats?.recommendedKeywords || []).map((k: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined, i: React.Key | null | undefined) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-slate-100 rounded-full text-sm text-slate-700 border border-slate-300"
                    >
                      {k}
                    </span>

                  ))}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <p className="text-xs text-slate-500 uppercase">Role Fit</p>
                <div className="text-2xl font-bold">{content}%</div>
              </Card>

              <Card className="p-4 text-center">
                <p className="text-xs text-slate-500 uppercase">Structure</p>
                <div className="text-2xl font-bold">{structure}%</div>
              </Card>

              <Card className="p-4 text-center">
                <p className="text-xs text-slate-500 uppercase">Tone</p>
                <div className="text-2xl font-bold">{tone}%</div>
              </Card>
            </div>
          </div>
        </div>

        {/* Detailed Analysis */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-indigo-500 rounded-full" />
            <h2 className="text-xl font-bold">Detailed Analysis</h2>
          </div>
          <span className="text-sm bg-slate-100 px-3 py-1 rounded-full">
            4 Categories
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SectionCard
            title="Content Quality"
            icon={BarChart3}
            data={report.content}
            score={content}
          />
          <SectionCard
            title="Tone & Style"
            icon={Type}
            data={report.toneStyle}
            score={tone}
          />
          <SectionCard
            title="Structure"
            icon={Layout}
            data={report.structure}
            score={structure}
          />
          <SectionCard
            title="Skills Match"
            icon={Award}
            data={report.skills}
            score={skills}
          />
        </div>

        {/* PASS / FAIL */}
        <div className="bg-white border rounded-xl p-6 shadow-md mt-10 space-y-4">
          {didPass ? (
            <>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 flex items-start gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="text-emerald-600 w-6 h-6" />
                </div>

                <div>
                  <p className="text-emerald-700 font-semibold text-lg">
                    Resume Screening Passed
                  </p>
                  <p className="text-sm text-emerald-600 mt-1 leading-relaxed">
                    Your resume meets the required ATS criteria and has been
                    successfully approved for the next stage.
                  </p>
                </div>
              </div>

              <button
                onClick={() => router.push(`/interview/${interview_id}/slot`)}
                className="px-6 py-3 rounded-lg bg-blue-600 text-white border border-blue-600
          hover:bg-blue-700 hover:border-blue-700 inline-flex gap-2"
              >
                Start Interview <ChevronRight size={16} />
              </button>
            </>
          ) : (
            <>
              <div className="relative overflow-hidden bg-linear-to-br from-rose-50 to-white border border-rose-200 rounded-2xl p-6 shadow-md">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-200/30 rounded-full blur-2xl" />

                <div className="relative flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-rose-600 flex items-center justify-center shadow-lg">
                    <XCircle className="text-white w-6 h-6" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-rose-800">
                      ATS Cutoff Not Met
                    </h3>
                    <p className="text-sm text-rose-700 mt-1">
                      Your resume scored below the required threshold and is not
                      eligible for interview progression.
                    </p>
                  </div>
                </div>
              </div>

              <button
                disabled
                className="px-6 py-3 rounded-lg bg-gray-400 text-white cursor-not-allowed"
              >
                Start Interview →
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
