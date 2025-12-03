"use client";

import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import FormContainer from "./_components/FormContainer";
import QuestionsList from "./_components/QuestionsList";
import InterviewLink from "./_components/InterviewLink";
import CreateSlots from "./_components/CreateSlots"; // ⭐ NEW STEP

interface CreateInterviewProps {
  session: any;
}

const CreateInterview: React.FC<CreateInterviewProps> = ({ session }) => {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [interviewId, setInterviewId] = useState<string>("");

  // ----------------------------------------------------
  // Generic form handler
  // ----------------------------------------------------
  const onHandleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ----------------------------------------------------
  // Back button logic
  // ----------------------------------------------------
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      return;
    }
    router.push("/dashboard");
  };

  // ----------------------------------------------------
  // When interview link is created → store interviewId → go to step 4
  // ----------------------------------------------------
  const onCreateLink = (id: string) => {
    setInterviewId(id);
    setStep(4); // ⭐ Jump to new STEP 4
  };

  // ----------------------------------------------------
  // Reset everything  
  // ----------------------------------------------------
  const handleReset = () => {
    setFormData({});
    setInterviewId("");
    setStep(1);
  };

  return (
    <div className="md:ml-2 lg:ml-6 mt-2 px-10 md:px-24 lg:px-44 xl:px-56">
      {/* ---------- HEADER ---------- */}
      <div className="flex items-center gap-5">
        <ArrowLeft
          onClick={handleBack}
          className="cursor-pointer hover:text-blue-500 transition-colors"
        />
        <h1 className="text-2xl font-bold">Create New Interview</h1>
      </div>

      {/* ---------- PROGRESS BAR ---------- */}
      <Progress
        value={(step / 4) * 100}
        className="my-4 [&>div]:bg-blue-600"
      />

      {/* ---------- STEP 1 ---------- */}
      {step === 1 && (
        <FormContainer
          formData={formData}
          onHandleInputChange={onHandleInputChange}
          GoToNextStep={() => setStep(2)}
        />
      )}

      {/* ---------- STEP 2 ---------- */}
      {step === 2 && (
        <QuestionsList
          formData={formData}
          session={session}
          onCreateLink={(id: string) => {
            // After generating questions, go to Step 3
            setInterviewId(id);
            setStep(3);
          }}
        />
      )}

      {/* ---------- STEP 3 ---------- */}
      {step === 3 && (
        <InterviewLink
          interviewId={interviewId}
          formData={formData}
          onCreate={() => setStep(4)}// -> step 4
          onReset={handleReset}
        />
      )}

      {/* ---------- ⭐ STEP 4 — CREATE SLOTS ---------- */}
      {step === 4 && (
        <CreateSlots
          interviewId={interviewId}
          duration={formData.interviewDuration}  
          onDone={() => router.push(`/interview/${interviewId}`)}
          onBack={() => setStep(3)}
        />
      )}
    </div>
  );
};

export default CreateInterview;
