"use client";

import React, { useMemo, useState } from "react";
import {
  Trophy,
  Search,
  Mail,
  Users,
  Award,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";

type InterviewProp = {
  id: string;
  jobPosition?: string | null;
  resumeScore?: number | null;
  createdAt?: string | Date | null;
};

type CandidateProp = {
  id: string;
  fullName: string;
  email: string;
  atsScore: number;
};

type Props = {
  interview: InterviewProp;
  candidates: CandidateProp[];
};

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
    {children}
  </div>
);

// ------------------ Avatar ------------------
const Avatar: React.FC<{ name?: string; className?: string }> = ({
  name = "User",
  className = "",
}) => {
  const initials = name
    .split(" ")
    .map((n) => (n ? n[0] : ""))
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const colors = [
    "bg-blue-100 text-blue-700",
    "bg-indigo-100 text-indigo-700",
    "bg-purple-100 text-purple-700",
    "bg-emerald-100 text-emerald-700",
    "bg-rose-100 text-rose-700",
  ];

  const colorClass = colors[(name || "").length % colors.length];

  return (
    <div
      className={`flex items-center justify-center font-bold text-sm rounded-full ${colorClass} ${className}`}
    >
      {initials}
    </div>
  );
};

// ------------------ Score Badge ------------------
const ScoreBadge: React.FC<{ score: number; threshold?: number | null }> = ({
  score,
  threshold = 0,
}) => {
  let colorClass = "bg-slate-100 text-slate-700 border-slate-200";

  if (score >= 90) colorClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
  else if (score >= (threshold ?? 0)) colorClass = "bg-blue-50 text-blue-700 border-blue-200";
  else colorClass = "bg-amber-50 text-amber-700 border-amber-200";

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold border ${colorClass}`}
    >
      {score}% Match
    </span>
  );
};

// ------------------ Rank Badge ------------------
const RankIcon: React.FC<{ rank: number }> = ({ rank }) => {
  if (rank === 1)
    return (
      <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
        <Trophy size={16} />
      </div>
    );
  if (rank === 2)
    return (
      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
        <Award size={16} />
      </div>
    );
  if (rank === 3)
    return (
      <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
        <Award size={16} />
      </div>
    );
  return <span className="text-slate-400 font-medium w-8 text-center">{rank}</span>;
};

export default function InterviewLeaderboardClient({
  interview,
  candidates = [],
}: Props) {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const processedCandidates = useMemo(() => {
    const q = (searchTerm || "").toLowerCase().trim();
    return (candidates || [])
      .filter((c) => {
        if (!q) return true;
        return (
          c.fullName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.atsScore - a.atsScore);
  }, [candidates, searchTerm]);

  const topThree = processedCandidates.slice(0, 3);
  const qualifiedCount = processedCandidates.filter(
    (c) => c.atsScore >= (interview.resumeScore ?? 0)
  ).length;

  const avgScore = processedCandidates.length
    ? Math.round(
        processedCandidates.reduce((a, b) => a + b.atsScore, 0) /
          processedCandidates.length
      )
    : 0;

  return (
    <div className="min-h-0 bg-transparent">
      {/* ⭐ FIXED CONTAINER – spreads beautifully on full screen */}
      <div className="w-full max-w-[1500px] mx-auto space-y-8 px-4 lg:px-8">

        {/* ---------------------- Header ---------------------- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-indigo-600 text-white text-[10px] sm:text-xs px-2 py-0.5 rounded font-medium">
                Active Interview
              </span>
              <span className="text-slate-400 text-xs sm:text-sm flex items-center gap-1">
                <TrendingUp size={12} /> High Volume
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">
              {interview.jobPosition}
            </h2>

            <p className="text-slate-500 mt-1 flex items-center gap-2 text-xs sm:text-sm">
              ATS Threshold:{" "}
              <span className="font-semibold text-slate-900">
                {interview.resumeScore}%
              </span>
            </p>
          </div>

          {/* Stats — Responsive */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto">
            <div className="bg-white px-4 py-2 rounded-lg border text-center">
              <p className="text-[10px] sm:text-xs text-slate-500 uppercase font-bold tracking-wider">
                Candidates
              </p>
              <p className="text-lg sm:text-xl font-bold text-slate-900 flex items-center justify-center gap-2">
                {processedCandidates.length}
                <Users size={14} className="text-slate-400" />
              </p>
            </div>

            <div className="bg-white px-4 py-2 rounded-lg border text-center">
              <p className="text-[10px] sm:text-xs text-slate-500 uppercase font-bold tracking-wider">
                Qualified
              </p>
              <p className="text-lg sm:text-xl font-bold text-emerald-600">
                {qualifiedCount}
              </p>
            </div>

            <div className="hidden sm:block bg-white px-4 py-2 rounded-lg border text-center">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                Avg Score
              </p>
              <p className="text-xl font-bold text-indigo-600">{avgScore}%</p>
            </div>
          </div>
        </div>

        {/* ---------------------- Podium ---------------------- */}
        {topThree.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {topThree.map((c, idx) => {
              const cardOrder =
                idx === 0 ? "order-1 lg:order-2" : idx === 1 ? "order-2 lg:order-1" : "order-3";

              return (
                <Card key={c.id} className={`${cardOrder} px-4 py-6 text-center`}>
                  <Avatar name={c.fullName} className="mx-auto w-14 h-14 sm:w-16 sm:h-16 mb-3" />
                  <h3 className="font-bold text-lg sm:text-xl">{c.fullName}</h3>
                  <ScoreBadge score={c.atsScore} threshold={interview.resumeScore} />
                </Card>
              );
            })}
          </div>
        )}

        {/* ---------------------- Search ---------------------- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
          <h2 className="text-lg font-bold text-slate-800">All Candidates</h2>

          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border rounded-lg text-sm focus:ring-indigo-500 w-full"
            />
          </div>
        </div>

        {/* ---------------------- Table ---------------------- */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b text-xs">
                  <th className="py-3 px-4 text-left uppercase">Rank</th>
                  <th className="py-3 px-4 text-left uppercase">Profile</th>
                  <th className="py-3 px-4 text-left uppercase">Contact</th>
                  <th className="py-3 px-4 uppercase">Score</th>
                  <th className="py-3 px-4 text-right uppercase">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {processedCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400">
                      No candidates found
                    </td>
                  </tr>
                ) : (
                  processedCandidates.map((c, i) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <RankIcon rank={i + 1} />
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={c.fullName} className="w-10 h-10" />
                          <div>
                            <p className="font-semibold">{c.fullName}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-slate-400" />
                          {c.email}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center font-bold">
                        {c.atsScore}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() =>
                            (window.location.href = `/interview/${interview.id}/candidates/${c.id}`)
                          }
                          className="text-indigo-600 flex items-center gap-1"
                        >
                          Details <ArrowUpRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
