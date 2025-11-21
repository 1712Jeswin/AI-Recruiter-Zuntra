"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, RefreshCcw, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface SessionUser {
  id: string;
  email: string;
  name?: string;
}

interface Session {
  user: SessionUser;
}

interface QuestionItem {
  question: string;
  type: string;
}

interface QuestionsListProps {
  formData: Record<string, any>;
  session: Session;
  onCreateLink: (interviewId: string) => void; // ✅ parent callback
}

const QuestionsList: React.FC<QuestionsListProps> = ({
  formData,
  session,
  onCreateLink,
}) => {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- ⚙️ Generate AI Interview Questions ---
  const generateAiInterviewQuestions = useCallback(async () => {
    if (!formData || Object.keys(formData).length === 0) return;

    setLoading(true);
    setError(null);
    setQuestions([]);

    try {
      const apiEndpoint = "/api/generate-questions";
      let response: Response;

      if (formData.file) {
        const body = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (value == null) return;
          if (key === "file") {
            body.append(key, value);
          } else if (Array.isArray(value)) {
            body.append(key, JSON.stringify(value));
          } else {
            body.append(key, String(value));
          }
        });

        response = await fetch(apiEndpoint, { method: "POST", body });
      } else {
        response = await fetch(apiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error (${response.status})`);
      }

      const data = await response.json();

      if (Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestions(data.questions);
        toast.success("✅ Questions generated successfully!");
      } else {
        toast.info("⚠️ No questions were generated.");
      }
    } catch (err: any) {
      console.error("❌ AI Generation Error:", err);
      setError(err.message || "Failed to generate questions.");
      toast.error(err.message || "Failed to generate questions.");
    } finally {
      setLoading(false);
    }
  }, [formData, session]);

  useEffect(() => {
    if (Object.keys(formData).length > 0 && !loading) {
      generateAiInterviewQuestions();
    }
  }, [formData, generateAiInterviewQuestions]);

  // --- 🧠 Save interview ---
  const handleFinish = async () => {
    if (loading) return;

    if (!session?.user?.id || !session?.user?.email) {
      toast.error("User not authenticated.");
      return;
    }

    if (questions.length === 0) {
      toast.info("Generate questions before saving.");
      return;
    }

    try {
      setLoading(true);

      const normalizedType =
        Array.isArray(formData.type) && formData.type.length > 0
          ? formData.type.map((t: any) => String(t))
          : formData.type
          ? [String(formData.type)]
          : [];

      const payload = {
        ...formData,
        type: normalizedType,
        userId: session.user.id,
        userEmail: session.user.email,
        questionList: questions,
        resumeScore: formData.resumeScore || null,
      };

      const res = await fetch("/api/save-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to save interview.");

      const interviewId = data.interviewId;

      if (interviewId) {
        toast.success("✅ Interview saved successfully!");
        // ✅ Pass to parent when finish clicked
        onCreateLink(interviewId);
      } else {
        toast.info("Interview saved, but ID not found.");
      }
    } catch (err: any) {
      console.error("❌ Save interview error:", err);
      toast.error(err.message || "Failed to save interview.");
    } finally {
      setLoading(false);
    }
  };

  // --- 🌀 Loading State ---
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <Loader2 className="animate-spin text-blue-600" size={42} />
        <p className="text-gray-700 text-lg font-medium">
          {formData.file
            ? "Analyzing your uploaded file..."
            : "Generating AI interview questions..."}
        </p>
        <p className="text-gray-500 text-sm">This may take a few seconds.</p>
      </div>
    );
  }

  // --- ❌ Error State ---
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl mt-6 shadow-sm">
        <h3 className="font-semibold text-lg mb-2">Error Occurred</h3>
        <p className="text-sm">{error}</p>
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={generateAiInterviewQuestions}
            className="flex items-center gap-2"
          >
            <RefreshCcw size={16} /> Try Again
          </Button>
        </div>
      </div>
    );
  }

  // --- ⚠️ Empty State ---
  if (!loading && questions.length === 0 && !error) {
    return (
      <div className="text-center text-gray-500 p-10 mt-6 bg-white rounded-xl shadow-sm border border-slate-200 animate-fade-in">
        No questions were generated yet.
      </div>
    );
  }

  // --- ✅ Success State ---
  return (
    <div className="w-full md:w-[95%] bg-white p-8 mt-6 rounded-2xl shadow-md border border-slate-200 mx-auto transition-all duration-300">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">
        🎯 Your Generated Questions
      </h2>

      <div className="flex flex-col gap-5">
        {questions.map((item, idx) => (
          <div
            key={idx}
            className="bg-gray-50 border border-slate-200 p-5 rounded-xl hover:shadow-md transition-all"
          >
            <p className="text-gray-800 text-base leading-relaxed mb-2">
              {item.question}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Type:</strong> {item.type}
            </p>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-10">
        <Button
          variant="outline"
          onClick={generateAiInterviewQuestions}
          disabled={loading}
          className="flex items-center gap-2 w-36 border-blue-600 text-blue-600 hover:bg-blue-50"
        >
          <RefreshCcw size={16} /> Regenerate
        </Button>

        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 w-56"
          onClick={handleFinish}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={16} /> Saving...
            </>
          ) : (
            <>
              Finish & Generate Link <ArrowRight size={16} />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default QuestionsList;
