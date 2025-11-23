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

export default function ResumePage() {
  const { interview_id } = useParams();
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

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

  if (!data)
    return (
      <div className="min-h-screen flex justify-center items-center p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Card className="w-full max-w-2xl p-8 rounded-2xl shadow-2xl bg-white/90 backdrop-blur">
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-20" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );

  async function submitResume() {
    if (!file) {
      return alert("Upload a resume first.");
    }

    setLoading(true);

    try {
      const createRes = await fetch("/api/candidate/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.fullName ?? "Unknown Candidate",
          email: data.userEmail ?? "unknown@example.com",
          interviewId: data.id,
        }),
      });

      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}));
        console.error("Create candidate failed:", err);
        setLoading(false);
        alert("Failed to create candidate. Check console for details.");
        return;
      }

      const createJson = await createRes.json();
      const candidateId = createJson?.candidateId;

      if (!candidateId || candidateId === "undefined") {
        console.error("Invalid candidateId returned:", createJson);
        setLoading(false);
        alert("Server returned invalid candidate id. Check console.");
        return;
      }

      const form = new FormData();
      form.append("resume", file);
      form.append("interviewId", data.id);
      form.append("candidateId", candidateId);

      const res = await fetch("/api/resume", {
        method: "POST",
        body: form,
      });

      setLoading(false);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Resume analysis failed:", err);
        alert("Analysis failed — check console for details.");
        return;
      }

      const js = await res.json();
      router.push(`/interview/${data.id}/feedback/${js.feedbackId}`);
    } catch (err) {
      console.error("submitResume error:", err);
      setLoading(false);
      alert("Unexpected error — check console.");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex justify-center items-center p-6">
      <Card className="w-full max-w-2xl rounded-2xl shadow-2xl bg-white/95 backdrop-blur-lg border border-white/20">
        <CardHeader className="pb-4 border-b">
          <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Resume Analysis
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 p-6 md:p-8">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Job Title</Label>
            <Input
              disabled
              value={data.jobPosition}
              className="cursor-not-allowed bg-gray-100 border border-gray-200 rounded-xl shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Job Description</Label>
            <Textarea
              disabled
              rows={5}
              value={data.jobDescription}
              className="cursor-not-allowed bg-gray-100 border border-gray-200 rounded-xl shadow-sm resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Upload Resume</Label>

            <div className="relative border-2 border-dashed border-blue-300 rounded-2xl p-8 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 flex flex-col items-center gap-3 text-center cursor-pointer shadow-inner">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <UploadCloud className="w-6 h-6 text-blue-600" />
              </div>

              <div className="space-y-1">
                <p className="text-gray-800 text-sm font-medium">
                  {file ? file.name : "Click to upload your resume"}
                </p>
                <p className="text-xs text-gray-500">PDF or DOCX formats supported</p>
              </div>

              <Input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                accept=".pdf,.docx,.doc"
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <Button
            className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-base shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
            disabled={loading}
            onClick={submitResume}
          >
            {loading ? "Analyzing…" : "Start Analysis →"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
