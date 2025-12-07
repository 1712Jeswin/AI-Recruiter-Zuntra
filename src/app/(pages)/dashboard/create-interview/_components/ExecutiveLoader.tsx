// EXECUTIVE LOADER (Interview Creation Theme)
import { useEffect, useState } from "react";
import { CheckCircle2, Target } from "lucide-react";

// 👇 Move steps outside component → stable reference → no ESLint warning
const steps = [
  "Analyzing job description...",
  "Understanding skills & requirements...",
  "Generating AI-tailored questions...",
  "Preparing interview package..."
];

export const ExecutiveLoader = ({ active }: { active: boolean }) => {
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!active) {
      setProgress(0);
      setStep(0);
      return;
    }

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 1;
      });
    }, 45);

    const stepTimer = setInterval(() => {
      setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1100);

    return () => {
      clearInterval(timer);
      clearInterval(stepTimer);
    };
  }, [active]);


  // circle math
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-6">
      <div className="relative flex items-center justify-center w-24 h-24">
        <svg className="transform -rotate-90 w-24 h-24">
          <circle
            strokeWidth="4"
            stroke="currentColor"
            className="text-slate-200"
            fill="transparent"
            r={radius}
            cx="48"
            cy="48"
          />
          <circle
            strokeWidth="4"
            stroke="currentColor"
            className="text-blue-600 transition-all"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx="48"
            cy="48"
          />
        </svg>

        {/* 👇 Updated center icon */}
        <div className="absolute text-blue-600">
          {progress === 100 ? (
            <CheckCircle2 size={26} />
          ) : (
            <Target size={26} className="animate-pulse" />
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <h3 className="text-slate-800 font-semibold tracking-tight text-lg">
          {progress === 100 ? "Interview Ready" : "Creating Interview"}
        </h3>

        {/* 👇 Updated status messages */}
        <p className="text-sm text-slate-500 h-6 animate-fade-in-up">
          {progress === 100 ? "Finalizing interview setup..." : steps[step]}
        </p>
      </div>
    </div>
  );
};
