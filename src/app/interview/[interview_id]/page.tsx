"use client";

import { Building2, Clock, Info } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function InterviewUI() {
  const { interview_id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  // Load interview settings
  useEffect(() => {
    if (!interview_id) return;

    async function load() {
      try {
        const res = await fetch(`/api/interview/${interview_id}`);
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.log("Error loading interview:", e);
      }
    }

    load();
  }, [interview_id]);

  if (!data)
    return (
      <div className="h-screen flex flex-col justify-center items-center text-gray-700 gap-3">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-blue-600">Loading interview…</p>
      </div>
    );

  return (
    <div className="h-screen flex justify-center items-center bg-gray-100 p-4 overflow-hidden">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-2xl p-6 border flex flex-row items-center gap-6">

        {/* LEFT SIDE (LOGO + IMAGE) */}
        <div className="flex-1 flex flex-col justify-center items-center text-center p-4 border-r border-gray-200">
          <Image
            src="/logo.png"
            width={200}
            height={100}
            alt="Logo"
            className="w-[100px] mx-auto"
          />
          <p className="text-gray-500 text-sm mt-1">AI-Powered Interview Platform</p>

          <Image
            src="/interview.png"
            width={500}
            height={500}
            alt="Interview Illustration"
            className="w-[280px] mt-4"
          />
        </div>

        {/* RIGHT SIDE — INSTRUCTIONS */}
        <div className="flex-1 p-6 flex flex-col justify-center">

          <h2 className="text-lg font-semibold">{data.jobPosition}</h2>

          <div className="flex items-center gap-4 text-gray-500 text-xs mt-2">
            <span>
              <Building2 className="inline w-3.5 h-3.5 mr-1" />
              {data.company || "Zuntra"}
            </span>

            <span>
              <Clock className="inline w-3.5 h-3.5 mr-1" />
              {data.duration || "30 Minutes"}
            </span>
          </div>

          {/* BIG INSTRUCTIONS BOX */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-5 text-left text-sm">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-blue-600" />
              <p className="font-semibold text-blue-600">Before You Begin</p>
            </div>

            <ul className="list-disc ml-5 space-y-2 text-gray-700 leading-relaxed">
              <li>
                Your resume will be analyzed to understand your skills, experience,
                strengths, and improvement areas.
              </li>

              <li>
                The AI will generate **personalized interview questions** based on:
                your resume, job role, and job description.
              </li>

              <li>
                Make sure your resume is in **PDF or DOCX** format and contains your
                experience clearly.
              </li>

              <li>
                This step ensures your interview is tailored exactly to your profile.
              </li>

              <li>
                After the resume evaluation, you will move to the **actual interview round**.
              </li>

              <li>
                The entire process is confidential and used only for enhancing interview quality.
              </li>
            </ul>
          </div>

          {/* START BUTTON */}
          <button
          type="button"
            onClick={() => router.push(`/interview/${interview_id}/resume`)}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg mt-6 font-medium hover:bg-blue-700 transition text-sm"
          >
            Start Resume Analysis →
          </button>
        </div>
      </div>
    </div>
  );
}
