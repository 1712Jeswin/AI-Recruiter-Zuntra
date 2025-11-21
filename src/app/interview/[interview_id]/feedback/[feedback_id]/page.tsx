"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

/* -----------------------------
   Main Feedback Page
------------------------------*/
export default function FeedbackPage() {
  const { feedback_id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/feedback/${feedback_id}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Feedback fetch failed:", err);
        setData({ error: "Fetch failed" });
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [feedback_id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] text-lg font-medium">
        Loading feedback…
      </div>
    );
  }

  if (!data || data.error) {
    return (
      <div className="text-center text-red-600 font-semibold p-10">
        Feedback not found
      </div>
    );
  }

  /* Normalize score values */
  const normalize = (val: any) => {
    if (!val) return 0;
    if (val > 0 && val <= 1) return Math.round(val * 100);
    return Math.round(val);
  };

  const overall = normalize(data.overallScore ?? data.fullReport?.overallScore);
  const tone = normalize(data.toneStyleScore ?? data.fullReport?.toneStyle?.score);
  const content = normalize(data.contentScore ?? data.fullReport?.content?.score);
  const structure = normalize(data.structureScore ?? data.fullReport?.structure?.score);
  const skills = normalize(data.skillsScore ?? data.fullReport?.skills?.score);
  const ats = normalize(data.atsScore ?? data.fullReport?.ats?.score);

  const report = data.fullReport ?? {};

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-10">
      {/* Page Title */}
      <header>
        <h1 className="text-3xl font-extrabold">Resume Review</h1>
        <p className="text-gray-500 text-sm mt-1">
          This analysis is based on the content and structure of your resume.
        </p>
      </header>

      {/* Big Score Card */}
      <div className="bg-white rounded-xl p-8 shadow border flex flex-col md:flex-row items-center gap-8">
        <ScoreCircle value={overall} />

        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-2">Your Resume Score</h2>
          <p className="text-sm text-gray-500 mb-4">
            The score is calculated by evaluating multiple factors.
          </p>

          {/* Mini Score Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <MiniScore label="Tone & Style" value={tone} />
            <MiniScore label="Content" value={content} />
            <MiniScore label="Structure" value={structure} />
            <MiniScore label="Skills" value={skills} />
            <MiniScore label="ATS Score" value={ats} />
          </div>
        </div>
      </div>

      {/* ATS Section */}
      <ATSSection score={ats} keywords={report.ats?.recommendedKeywords || []} />

      {/* Expandable Sections */}
      <div className="space-y-4">
        <Collapsible title="Tone & Style" score={tone} data={report.toneStyle} />
        <Collapsible title="Content" score={content} data={report.content} />
        <Collapsible title="Structure" score={structure} data={report.structure} />
        <Collapsible title="Skills" score={skills} data={report.skills} />
      </div>
    </div>
  );
}

/* -----------------------------
   Components
------------------------------*/

// Circular score meter
function ScoreCircle({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value));
  const radius = 54;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const offset = circumference - (pct / 100) * circumference;

  const color = pct >= 75 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <svg height="130" width="130" className="block">
      <circle
        stroke="#e5e7eb"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx="65"
        cy="65"
      />
      <circle
        stroke={color}
        fill="transparent"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={offset}
        r={normalizedRadius}
        cx="65"
        cy="65"
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="font-bold text-xl fill-gray-900"
      >
        {pct}
      </text>
      <text
        x="50%"
        y="65%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="fill-gray-400 text-xs"
      >
        /100
      </text>
    </svg>
  );
}

// small score indicator cards
function MiniScore({ label, value }: any) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border flex justify-between items-center">
      <div>
        <div className="text-sm font-medium">{label}</div>
      </div>
      <div className="font-semibold">{value}/100</div>
    </div>
  );
}

// ATS section
function ATSSection({ score, keywords }: any) {
  return (
    <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-xl">
      <h3 className="text-xl font-semibold mb-2">ATS Score — {score}/100</h3>
      <p className="text-sm text-gray-600">
        Applicant Tracking System compatibility evaluation and suggestions.
      </p>

      <div className="mt-4">
        <h4 className="font-medium">Recommended Keywords</h4>
        <div className="flex flex-wrap gap-2 mt-2">
          {keywords.map((k: any, i: number) => (
            <span
              key={i}
              className="px-3 py-1 bg-white rounded-full border text-sm text-gray-700"
            >
              {k}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// collapsible block
function Collapsible({ title, score, data }: any) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border rounded-lg bg-white shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex items-center justify-between text-left"
      >
        <span className="font-semibold">{title} — {score}/100</span>
        <span className="text-gray-400">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-6 pb-6 pt-2 space-y-4">
          <div>
            <h4 className="font-medium mb-1">Strengths</h4>
            <ul className="list-disc text-sm pl-5 text-gray-700 space-y-1">
              {data?.strengths?.length
                ? data.strengths.map((s: any, i: number) => <li key={i}>{s}</li>)
                : <li className="text-gray-400">None listed</li>}
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-1">Improvements</h4>
            <ul className="list-disc text-sm pl-5 text-gray-700 space-y-1">
              {data?.improvements?.length
                ? data.improvements.map((s: any, i: number) => <li key={i}>{s}</li>)
                : <li className="text-gray-400">None listed</li>}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
