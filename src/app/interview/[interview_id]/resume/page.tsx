"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UploadCloud } from "lucide-react";
import { CheckCircle2, ShieldCheck, Wifi, Server, Code2 } from "lucide-react";

/* ------------------------------------------------------
   🔥 UPDATED LOADER — EXACT REPLICA FROM REFERENCE FILE
-------------------------------------------------------*/
const TechLoader = ({ active }: { active: boolean }) => {
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
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-mono text-slate-500 uppercase tracking-widest font-semibold">
          Resume Analysis System
        </span>
      </div>

      {/* Steps */}
      <div className="space-y-5">
        {items.map((item, index) => {
          const Icon = item.icon;

          const isComplete = activeStep > index;
          const isCurrent = activeStep === index;

          return (
            <div
              key={index}
              className="flex items-center gap-4 transition-all duration-300"
            >
              {/* Icon container */}
              <div
                className={`
                  w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300
                  ${
                    isComplete
                      ? "bg-emerald-50 text-emerald-600"
                      : isCurrent
                      ? "bg-indigo-50 text-indigo-600 scale-110 shadow"
                      : "bg-slate-50 text-slate-300"
                  }
                `}
              >
                {isComplete ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <Icon
                    size={18}
                    className={isCurrent ? "animate-spin-slow" : ""}
                  />
                )}
              </div>

              {/* Text */}
              <span
                className={`
                  text-sm font-mono
                  ${isCurrent ? "text-slate-800 font-bold" : "text-slate-500"}
                `}
              >
                {item.text}
                {isCurrent && <span className="animate-pulse">_</span>}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ------------------------------------------------------
   🔥 MAIN PAGE COMPONENT — LOGIC NOT TOUCHED
-------------------------------------------------------*/
export default function ResumePage() {
  const { interview_id } = useParams();
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Route protection
  useEffect(() => {
    const verifiedCandidate = localStorage.getItem("candidateId");
    if (!verifiedCandidate && interview_id) {
      router.replace(`/interview/${interview_id}`);
    }
  }, [interview_id, router]);

  // Load interview data
  useEffect(() => {
    if (!interview_id) return;

    async function load() {
      try {
        const res = await fetch(`/api/interview/${interview_id}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.log(err);
      }
    }
    load();
  }, [interview_id]);

  // Skeleton
  if (!data)
    return (
      <div className="min-h-screen flex justify-center items-center p-6 bg-gray-50">
        <Card className="w-full max-w-3xl p-8 rounded-2xl shadow-xl bg-white">
          <CardHeader>
            <Skeleton className="h-7 w-48 mb-2" />
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    );

  // Submit resume
  async function submitResume() {
    if (!file) return alert("Upload a resume first.");

    setLoading(true);

    try {
      const candidateId = localStorage.getItem("candidateId");
      if (!candidateId) {
        setLoading(false);
        return alert("Candidate not verified.");
      }

      const form = new FormData();
      form.append("resume", file);
      form.append("interviewId", data.id);
      form.append("candidateId", candidateId);

      const res = await fetch("/api/resume", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        setLoading(false);
        return alert("Resume analysis failed.");
      }

      const js = await res.json();
      router.push(`/interview/${data.id}/feedback/${js.feedbackId}`);
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("Unexpected error.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-start p-8">
      {/* Loader */}
      {loading && (
        <div className="w-full flex justify-center mt-24">
          <TechLoader active={true} />
        </div>
      )}
 
      {/* Hide form while loading */}
      {!loading && (
        <Card className="w-full max-w-3xl rounded-2xl shadow-lg bg-white border border-gray-200 p-6">
          <CardHeader className="pb-6 border-b">
            <CardTitle className="text-xl font-bold text-slate-900 tracking-tight">
              Resume Analysis
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Optimize your hiring process with AI-driven insights.
            </p>
          </CardHeader>

          <CardContent className="space-y-10 pt-6">
            {/* Step 1 */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Job Details <span className="text-xs text-gray-500">• Step 1 of 2</span>
              </h3>

              <div className="space-y-2">
                <Label>Job Title</Label>
                <Input
                  disabled
                  value={data.jobPosition}
                  className="bg-gray-100 border-gray-200 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Job Description</Label>
                <Textarea
                  disabled
                  rows={6}
                  value={data.jobDescription}
                  className="bg-gray-100 border-gray-200 rounded-xl resize-none"
                />
              </div>
            </div>

            {/* Step 2 */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Candidate Resume <span className="text-xs text-gray-500">• Step 2 of 2</span>
              </h3>

              <div
                className="relative border-2 border-dashed border-gray-300 rounded-2xl p-10 bg-gray-50 hover:bg-gray-100 transition-all flex flex-col items-center gap-3 cursor-pointer"
                onClick={() =>
                  document.getElementById("resumeUploadInput")?.click()
                }
              >
                <UploadCloud className="w-10 h-10 text-gray-600" />

                <p className="text-gray-800 text-sm font-medium">
                  {file ? file.name : "Click to upload or drag & drop"}
                </p>

                <Input
                  id="resumeUploadInput"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>

            {/* Start */}
            <Button
              className="w-full h-12 rounded-xl bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700"
              onClick={submitResume}
              disabled={loading}
            >
              Start Analysis →
            </Button>

            <p className="text-center text-xs text-gray-500 -mt-2">
              By clicking Start, you agree to data processing.
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 max-w-xl mx-auto">
              <div className="flex items-center gap-2 bg-white border px-4 py-3 rounded-xl shadow-sm">
                <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  ✓
                </div>
                <p className="text-sm font-medium text-gray-700">95% Accuracy</p>
              </div>

              <div className="flex items-center gap-2 bg-white border px-4 py-3 rounded-xl shadow-sm">
                <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                  ✦
                </div>
                <p className="text-sm font-medium text-gray-700">AI Insights</p>
              </div>

              <div className="flex items-center gap-2 bg-white border px-4 py-3 rounded-xl shadow-sm">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                  📄
                </div>
                <p className="text-sm font-medium text-gray-700">Supports PDF/DOC</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
