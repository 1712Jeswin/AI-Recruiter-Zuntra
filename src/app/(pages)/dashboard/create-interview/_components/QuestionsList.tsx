"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  RefreshCcw,
  ArrowRight,
  Target,
  Copy,
  Check,
  Code2,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ExecutiveLoader } from "./ExecutiveLoader";

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
  onCreateLink: (interviewId: string) => void;
}

const QuestionsList: React.FC<QuestionsListProps> = ({
  formData,
  session,
  onCreateLink,
}) => {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedText, setEditedText] = useState("");
  const [editedTag, setEditedTag] = useState("");

  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

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
          if (key === "file") body.append(key, value);
          else if (Array.isArray(value))
            body.append(key, JSON.stringify(value));
          else body.append(key, String(value));
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

      // ⬅️ FIX APPLIED HERE — preserve AI-generated types
      if (Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestions(data.questions);
        toast.success("✅ Questions generated successfully!");
      } else {
        toast.info("⚠️ No questions were generated.");
      }
    } catch (err: any) {
      console.error("AI Generation Error:", err);
      setError(err.message || "Failed to generate questions.");
      toast.error(err.message || "Failed to generate questions.");
    } finally {
      setLoading(false);
    }
  }, [formData]);

  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      generateAiInterviewQuestions();
    }
  }, [formData, generateAiInterviewQuestions]);

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

    const firstUntagged = questions.findIndex((q) => !q.type.trim());

    if (firstUntagged !== -1) {
      toast.error("Please assign a tag to all questions before finishing.");

      const ref = questionRefs.current[firstUntagged];
      if (ref) {
        ref.scrollIntoView({ behavior: "smooth", block: "center" });
      }

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
        onCreateLink(interviewId);
      } else {
        toast.info("Interview saved but ID missing.");
      }
    } catch (err: any) {
      console.error("Save interview error:", err);
      toast.error(err.message || "Failed to save interview.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const startEditing = (index: number, text: string, type: string) => {
    setEditingIndex(index);
    setEditedText(text);
    setEditedTag(type);
  };

  const saveEdit = (index: number) => {
    const updated = [...questions];
    updated[index].question = editedText.trim();
    updated[index].type = editedTag.trim();
    setQuestions(updated);
    setEditingIndex(null);
    toast.success("Question updated!");
  };

  if (loading) {
    return (
      <div className="w-full bg-white rounded-xl shadow-md border border-slate-200 mt-6">
        <ExecutiveLoader active={true} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-8 rounded-2xl mt-6 shadow-sm text-red-700">
        <h3 className="text-lg font-semibold">Error Occurred</h3>
        <p className="text-sm mt-1">{error}</p>

        <Button
          variant="outline"
          onClick={generateAiInterviewQuestions}
          className="mt-4 flex items-center gap-2 border-red-300 text-red-700 hover:bg-red-100"
        >
          <RefreshCcw size={16} /> Try Again
        </Button>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="p-10 text-center bg-white rounded-2xl mt-6 border shadow-sm text-gray-500">
        No questions were generated yet.
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mt-6">
      {/* HEADER */}
      <div className="px-8 py-6 border-b bg-slate-50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-blue-700 rounded-lg shadow-sm">
            <Target size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {formData.file
                ? "Extracted Questions"
                : "Your Generated Questions"}
            </h2>

            <p className="text-sm text-slate-500 font-medium">
              {formData.file
                ? "Questions extracted from your uploaded file"
                : "Review and finalize your interview set"}
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-3 py-1 bg-slate-200 text-slate-600 rounded-full">
          {questions.length} Questions
        </span>
      </div>

      {/* WARNING */}
      {formData.file && questions.some((q) => !q.type?.trim()) && (
        <div className="mx-8 mt-5 mb-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm leading-relaxed">
          <strong className="font-semibold">Important:</strong>
          These questions were extracted from your uploaded file. Please review
          and <strong>add a tag to every question</strong> before finishing.
        </div>
      )}

      {/* QUESTION LIST */}
      <div className="p-8 space-y-4">
        {questions.map((item, idx) => {
          const isMissingTag = !item.type?.trim();

          return (
            <div
              key={idx}
              ref={(el) => {
                questionRefs.current[idx] = el;
              }}
              className={`group relative p-5 border rounded-xl bg-white transition-all ${
                isMissingTag
                  ? "border-red-400 bg-red-50/50"
                  : "border-slate-200 hover:border-blue-300 hover:shadow-md"
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 space-y-3">
                  {editingIndex === idx ? (
                    <>
                      <textarea
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        className="w-full text-sm border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all resize-none"
                        rows={3}
                      />

                      <select
                        value={editedTag}
                        onChange={(e) => setEditedTag(e.target.value)}
                        className="w-full text-sm border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                      >
                        <option value="">-- Select Tag --</option>
                        <option value="Technical">Technical</option>
                        <option value="Behavioral">Behavioral</option>
                        <option value="Experience">Experience</option>
                        <option value="Problem Solving">Problem Solving</option>
                        <option value="Leadership">Leadership</option>
                      </select>

                      {isMissingTag && (
                        <p className="text-xs text-red-600 mt-1">
                          Tag is required for this question.
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <h3 className="text-base font-medium text-slate-800 transition-colors group-hover:text-blue-900">
                        {item.question}
                      </h3>

                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wide border ${
                          isMissingTag
                            ? "bg-red-100 border-red-300 text-red-700"
                            : "bg-blue-50 border-blue-100 text-blue-700"
                        }`}
                      >
                        <Code2 size={12} />
                        {item.type || "No Tag"}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex flex-col gap-2 items-center">
                  {editingIndex !== idx && (
                    <button
                      onClick={() => handleCopy(item.question, idx)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      {copiedIndex === idx ? (
                        <Check size={16} className="text-green-500" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  )}

                  <button
                    onClick={() =>
                      editingIndex === idx
                        ? saveEdit(idx)
                        : startEditing(idx, item.question, item.type)
                    }
                    className={`p-2 transition-all rounded-lg ${
                      editingIndex === idx
                        ? "bg-green-100 text-green-600 hover:bg-green-200"
                        : "opacity-0 group-hover:opacity-100 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                    }`}
                  >
                    {editingIndex === idx ? (
                      <Check size={16} className="text-green-600" />
                    ) : (
                      <Pencil size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-8 py-6 bg-slate-50 border-t flex justify-between flex-col sm:flex-row gap-3">
        {!formData.file && (
          <Button
            variant="outline"
            disabled={loading}
            onClick={generateAiInterviewQuestions}
            className="flex items-center gap-2 border-slate-300 text-slate-700 hover:border-blue-300 hover:text-blue-700 hover:bg-white"
          >
            <RefreshCcw size={16} />
            Regenerate
          </Button>
        )}

        <Button
          onClick={handleFinish}
          disabled={loading}
          className="bg-blue-700 hover:bg-blue-800 text-white flex items-center gap-2 shadow-md"
        >
          Finish <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
};

export default QuestionsList;
