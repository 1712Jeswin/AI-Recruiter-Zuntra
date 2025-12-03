"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  MapPin,
  Copy,
  Check,
  Briefcase,
} from "lucide-react";

// --------------------------------------
// EXECUTIVE LOADER
// --------------------------------------
const ExecutiveLoader = () => {
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);

  const steps = [
    "Checking your session...",
    "Verifying booking status...",
    "Syncing your calendar...",
    "Preparing interview portal...",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 1));
    }, 45);

    const stepTimer = setInterval(() => {
      setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1200);

    return () => {
      clearInterval(timer);
      clearInterval(stepTimer);
    };
  }, []);

  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-28 h-28 flex items-center justify-center">
        <svg className="w-28 h-28 transform -rotate-90">
          <circle
            cx="56"
            cy="56"
            r={radius}
            strokeWidth="4"
            stroke="currentColor"
            className="text-slate-200"
            fill="transparent"
          />

          <circle
            cx="56"
            cy="56"
            r={radius}
            strokeWidth="4"
            stroke="currentColor"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-indigo-600 transition-all duration-300"
            fill="transparent"
          />
        </svg>

        <div className="absolute text-indigo-600">
          {progress === 100 ? (
            <CheckCircle2 size={26} />
          ) : (
            <Briefcase size={26} className="animate-pulse" />
          )}
        </div>
      </div>

      <h2 className="text-lg font-semibold text-slate-800">
        {progress === 100 ? "Loading…" : "Setting things up"}
      </h2>
      <p className="text-sm text-slate-500 h-5">{steps[step]}</p>
    </div>
  );
};

// --------------------------------------
// MAIN PAGE
// --------------------------------------
interface Booking {
  start: string;
  end?: string;
  meetingLink?: string;
  [key: string]: any;
}

export default function ScheduledPage() {
  const router = useRouter();
  const params = useParams();
  const interview_id = params?.interview_id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // countdown
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // --------------------------------------
  // FETCH BOOKING FROM BACKEND
  // --------------------------------------
  useEffect(() => {
    async function loadBooking() {
      const res = await fetch(`/api/bookings/get-time?interview_id=${interview_id}`);
      const data = await res.json();

      if (data?.start) {
        setBooking(data);
      }

      setLoading(false);
    }

    loadBooking();
  }, [interview_id]);

  // --------------------------------------
  // COUNTDOWN EFFECT
  // --------------------------------------
  useEffect(() => {
    if (!booking?.start) return;

    const startTime = new Date(booking.start).getTime();

    if (isNaN(startTime)) {
      console.error("Invalid start time:", booking.start);
      return;
    }

    const update = () => {
      const diff = Math.floor((startTime - Date.now()) / 1000);
      setTimeLeft(diff <= 0 ? 0 : diff);
    };

    update(); // run immediately once

    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [booking]);

  const formatCountdown = (seconds: number) => {
    if (seconds <= 0) return "Starting now";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;
  };

  // --------------------------------------
  // SHOW EXECUTIVE LOADER UNTIL BOOKING LOADED
  // --------------------------------------
  if (loading || !booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-8">
        <div className="bg-white px-10 py-12 rounded-2xl shadow-xl border border-slate-200 w-full max-w-md text-center">
          <ExecutiveLoader />
          <p className="text-sm text-slate-500 mt-6">Looking for your booking…</p>
        </div>
      </div>
    );
  }

  // --------------------------------------
  // SUCCESS PAGE
  // --------------------------------------
  const startDate = new Date(booking.start);
  const endDate = booking.end ? new Date(booking.end) : null;

  const dateStr = startDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const timeStr = endDate
    ? `${startDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })} - ${endDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      })}`
    : startDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      });

  const handleCopy = () => {
    if (booking.meetingLink) {
      navigator.clipboard.writeText(booking.meetingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-b from-indigo-50/50 to-white pt-10 pb-6 px-8 text-center border-b border-slate-50">
            <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 ring-8 ring-green-50 shadow-sm">
              <CheckCircle2 className="w-8 h-8" strokeWidth={3} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold">
              Interview Scheduled!
            </h1>
            <p className="text-slate-500 text-base sm:text-lg mt-2 max-w-md mx-auto">
              You're all set. We've reserved your interview slot successfully.
            </p>
          </div>

          {/* Details */}
          <div className="p-8 space-y-8">
            {/* Date & Time */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Date & Time
              </h3>
              <div className="flex items-start gap-3 text-slate-700">
                <Calendar className="w-5 h-5 text-indigo-500 mt-0.5" />
                <div>
                  <p className="font-medium">{dateStr}</p>
                  <p className="text-slate-500 text-sm">{timeStr}</p>
                </div>
              </div>
            </div>

            {/* Countdown */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
              <p className="text-sm font-semibold text-blue-700 flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" /> Interview starts in:
              </p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {timeLeft === null
                  ? "---"
                  : timeLeft <= 0
                  ? "Starting now"
                  : formatCountdown(timeLeft)}
              </p>
            </div>

            {/* Meeting Link */}
            {booking.meetingLink && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Meeting Link
                </h3>
                <div className="flex items-start gap-3 text-slate-700">
                  <MapPin className="w-5 h-5 text-indigo-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Online Interview</p>
                    <p className="text-slate-500 text-sm mt-0.5 truncate max-w-[240px]">
                      {booking.meetingLink}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCopy}
                  className="mt-3 flex items-center gap-2 text-sm bg-white border border-slate-200 hover:bg-slate-50 px-3 py-2 rounded-lg transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-400" />
                      Copy Link
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Start Button */}
        <button
  disabled={timeLeft === null || timeLeft > 0}  // 🔒 lock before start
  onClick={() =>
    timeLeft <= 0 &&
    router.push(`interview/${interview_id}/start-interview`)
  }
  className={`w-full text-lg font-semibold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all
    ${
      timeLeft <= 0
        ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer hover:-translate-y-0.5"
        : "bg-slate-300 text-slate-500 cursor-not-allowed"
    }
  `}
>
  {timeLeft > 0 ? "Interview Not Started" : "Go to Interview Dashboard"}
  <ArrowRight className="w-5 h-5" />
</button>

          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
            <span className="font-mono">ID: {interview_id}</span>
          </div>
        </div>
      </main>
    </div>
  );
}
