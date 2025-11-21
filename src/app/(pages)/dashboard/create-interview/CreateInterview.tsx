"use client";

import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import FormContainer from "./_components/FormContainer";
import QuestionsList from "./_components/QuestionsList";
import InterviewLink from "./_components/InterviewLink";

interface CreateInterviewProps {
  session: any; // ✅ receive session from server
}

const CreateInterview: React.FC<CreateInterviewProps> = ({ session }) => {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [interviewId, setInterviewId] = useState<string>("");

  const onHandleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    console.log("🔍 Current Step:", step);
    console.log("🧾 Current Form Data:", formData);
  }, [step, formData]);

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.push("/dashboard");
    }
  };

  const onCreateLink = (interviewId: string) => {
    setInterviewId(interviewId);
    setStep(step + 1);
  };

  const handleReset = () => {
    setFormData({});
    setInterviewId("");
    setStep(1); // 👈 Reset to first step
  };

  return (
    <div className="md:ml-2 lg:ml-6 mt-2 px-10 md:px-24 lg:px-44 xl:px-56">
      {/* Header */}
      <div className="flex items-center gap-5">
        <ArrowLeft
          onClick={handleBack}
          className="cursor-pointer hover:text-blue-500 transition-colors"
        />
        <h1 className="text-2xl font-bold">Create New Interview</h1>
      </div>

      <Progress value={step * 33.33} className="my-4" />

      {step === 1 ? (
        <FormContainer
          formData={formData}
          onHandleInputChange={onHandleInputChange}
          GoToNextStep={() => setStep(step + 1)}
        />
      ) : step === 2 ? (
        <QuestionsList
          formData={formData}
          session={session}
          onCreateLink={(interviewId) => onCreateLink(interviewId)}
        />
      ) : step === 3 ? (
        <InterviewLink
          interviewId={interviewId}
          formData={formData}
          onReset={handleReset} // ✅ Reset handler
        />
      ) : null}
    </div>
  );
};

export default CreateInterview;
