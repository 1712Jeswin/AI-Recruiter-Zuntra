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

  // Load interview details
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
      <div className="min-h-screen flex justify-center items-center p-6">
        <Card className="w-full max-w-2xl p-6">
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
    // 1) Create candidate (only if you don't already have one)
    // If you already have candidateId in state, skip this and use it.
    // Example: if (data.candidateId) candidateId = data.candidateId;
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

    // Validate candidateId is present and not the string "undefined"
    if (!candidateId || candidateId === "undefined") {
      console.error("Invalid candidateId returned:", createJson);
      setLoading(false);
      alert("Server returned invalid candidate id. Check console.");
      return;
    }

    // 2) Now upload resume with a proper candidateId
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
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-center">
            Resume Analysis
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <Label>Job Title</Label>
            <Input disabled value={data.jobPosition} className="cursor-not-allowed bg-gray-100" />
          </div>

          <div>
            <Label>Job Description</Label>
            <Textarea disabled rows={5} value={data.jobDescription} className="cursor-not-allowed bg-gray-100" />
          </div>

          {/* Upload Section */}
          <div>
            <Label>Upload Resume</Label>

            <div className="relative border border-dashed rounded-lg p-6 bg-gray-50 hover:bg-gray-100 flex flex-col items-center gap-2 text-center cursor-pointer">
              <UploadCloud className="w-6 h-6 text-gray-600" />
              <p className="text-gray-700 text-sm">
                {file ? file.name : "Click to upload PDF or DOCX"}
              </p>

              <Input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                accept=".pdf,.docx,.doc"
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <Button
            className="w-full bg-blue-600 text-white hover:bg-blue-700"
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
