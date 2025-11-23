"use client";

import { Building2, Clock, Info } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, Briefcase } from "lucide-react";

// ---------------------
// LOADER COMPONENT
// ---------------------
const ExecutiveLoader = () => {
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);

  const steps = [
    "Establishing secure connection...",
    "Verifying interview session...",
    "Loading job information...",
    "Preparing interview room...",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 1;
      });
    }, 50);

    const stepTimer = setInterval(() => {
      setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1200);

    return () => {
      clearInterval(timer);
      clearInterval(stepTimer);
    };
  }, []);

  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative flex items-center justify-center w-24 h-24">
        <svg className="transform -rotate-90 w-24 h-24">
          <circle
            className="text-slate-200"
            strokeWidth="4"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="48"
            cy="48"
          />
          <circle
            className="text-blue-600 transition-all duration-300 ease-out"
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="48"
            cy="48"
          />
        </svg>

        <div className="absolute text-blue-600">
          {progress === 100 ? (
            <CheckCircle2 size={26} />
          ) : (
            <Briefcase size={26} className="animate-pulse" />
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <h3 className="text-slate-800 font-semibold tracking-tight text-lg">
          {progress === 100 ? "Ready" : "Interview Room"}
        </h3>
        <div className="h-6 flex items-center">
          <p className="text-sm text-slate-500 font-medium animate-fade-in-up">
            {progress === 100 ? "Loading..." : steps[step]}
          </p>
        </div>
      </div>
    </div>
  );
};

// ---------------------
// MAIN COMPONENT
// ---------------------

export default function InterviewUI() {
  const { interview_id } = useParams();
  const router = useRouter();

  const [data, setData] = useState<any>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const [otp, setOtp] = useState("");

  const [step, setStep] = useState<"info" | "otp" | "instructions">("info");

  const [loading, setLoading] = useState(false);

  const [verificationId, setVerificationId] = useState("");

  // Load interview details
  useEffect(() => {
    if (!interview_id) return;

    async function load() {
      const res = await fetch(`/api/interview/${interview_id}`);
      const json = await res.json();
      setData(json);
    }

    load();
  }, [interview_id]);

  // STEP 1 – Start verification
  async function startVerification() {
    if (!fullName || !email) {
      alert("Enter full name and email");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/candidate/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, interviewId: interview_id }),
    });

    const json = await res.json();
    setLoading(false);

    if (!json.success) return alert(json.error);

    setVerificationId(json.verificationId);
    setStep("otp");
  }

  // STEP 2 – Verify OTP
  async function verifyOtp() {
    if (otp.length !== 6) {
      alert("Enter a 6 digit OTP");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/candidate/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName,
        email,
        otp,
        interviewId: interview_id,
      }),
    });

    const json = await res.json();
    setLoading(false);

    if (!json.success) {
      alert(json.error);
      return;
    }

    localStorage.setItem("candidateId", json.candidateId);

    setStep("instructions");
  }

  if (!data)
    return (
      <div className="h-screen flex justify-center items-center bg-gray-50">
        <ExecutiveLoader />
      </div>
    );

  return (
    <div className="h-screen flex justify-center items-center bg-gray-100 p-4 overflow-hidden">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-2xl p-6 border flex flex-row items-center gap-6">

        {/* LEFT */}
        <div className="flex-1 flex flex-col items-center text-center p-4 border-r">
          <Image src="/logo.png" width={100} height={100} alt="Logo" />
          <p className="text-gray-500 text-sm mt-1">AI-Powered Interview Platform</p>

          <Image src="/interview.png" width={280} height={280} alt="Illustration" />
        </div>

        {/* RIGHT */}
        <div className="flex-1 p-6">
          <h2 className="text-lg font-semibold">{data.jobPosition}</h2>

          <div className="flex items-center gap-4 text-gray-500 text-xs mt-2">
            <span><Building2 className="inline w-3.5 h-3.5 mr-1" /> {data.company || "Zuntra"}</span>
            <span><Clock className="inline w-3.5 h-3.5 mr-1" /> {data.duration || "30 Minutes"}</span>
          </div>

          {/* STEP 1 — NAME + EMAIL */}
          {step === "info" && (
            <>
              <div className="mt-4">
                <label className="text-xs font-medium">Full Name</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="mt-3">
                <label className="text-xs font-medium">Email</label>
                <input
                  type="email"
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                onClick={startVerification}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg mt-5"
                disabled={loading}
              >
                {loading ? "Processing…" : "Next →"}
              </button>
            </>
          )}

          {/* STEP 2 — OTP */}
          {step === "otp" && (
            <>
              <p className="text-sm text-gray-700 mt-4">
                Enter the 6-digit OTP sent to <b>{email}</b>
              </p>

              <input
                type="text"
                className="mt-3 w-full border rounded-lg px-3 py-2 text-center tracking-widest text-lg"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />

              <button
                onClick={verifyOtp}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg mt-5"
                disabled={loading}
              >
                {loading ? "Verifying…" : "Verify OTP →"}
              </button>
            </>
          )}

          {/* STEP 3 — INSTRUCTIONS */}
          {step === "instructions" && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-5 text-left text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  <p className="font-semibold text-blue-600">Before You Begin</p>
                </div>

                <ul className="list-disc ml-5 text-gray-700">
                  <li>Resume will be analyzed for skills.</li>
                  <li>AI will create personalized questions.</li>
                  <li>Upload PDF or DOCX format.</li>
                  <li>Interview begins after resume analysis.</li>
                </ul>
              </div>

              <button
                onClick={() => router.push(`/interview/${interview_id}/resume`)}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg mt-6"
              >
                Start Resume Analysis →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
