"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

// Components
import FormContainer from "./_components/FormContainer";
import QuestionsList from "./_components/QuestionsList";
import InterviewLink from "./_components/InterviewLink";
import CreateSlots from "./_components/CreateSlots";

interface CreateInterviewProps {
  session: any;
}

const CreateInterview: React.FC<CreateInterviewProps> = ({ session }) => {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [interviewId, setInterviewId] = useState<string>("");

  // ----------------------------------------
  // Generic form handler
  // ----------------------------------------
  const onHandleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ----------------------------------------
  // Back
  // ----------------------------------------
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      return;
    }
    router.push("/dashboard");
  };

  // ----------------------------------------
  // When Questions step creates an interview → go to slots
  // ----------------------------------------
  const onQuestionsCreated = (id: string) => {
    setInterviewId(id);
    setStep(3);
  };

  // ----------------------------------------
  // Reset
  // ----------------------------------------
  const handleReset = () => {
    setFormData({});
    setInterviewId("");
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-slate-50/30 py-8 md:py-12">
      <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-8 md:mb-10">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBack}
              className="rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors -ml-2"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Create New Interview</h1>
              <p className="text-sm md:text-base text-slate-500 mt-1">Follow the steps to set up your AI-powered interview.</p>
            </div>
          </div>

          {/* Progress Indicator Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/60">
             <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                <span className={step >= 1 ? "text-blue-600" : ""}>1. Details</span>
                <span className={step >= 2 ? "text-blue-600" : ""}>2. Questions</span>
                <span className={step >= 3 ? "text-blue-600" : ""}>3. Scheduling</span>
                <span className={step >= 4 ? "text-blue-600" : ""}>4. Finish</span>
             </div>
             {/* Customizing progress bar color */}
             <div className="relative w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-500 ease-in-out rounded-full"
                  style={{ width: `${(step / 4) * 100}%` }}
                />
             </div>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="transition-all duration-300 ease-in-out">
          {/* STEP 1 */}
          {step === 1 && (
            <FormContainer
              formData={formData}
              onHandleInputChange={onHandleInputChange}
              GoToNextStep={() => setStep(2)}
            />
          )}

          {/* STEP 2 – Questions */}
          {step === 2 && (
            <QuestionsList
              formData={formData}
              session={session}
              onCreateLink={onQuestionsCreated}
            />
          )}

          {/* STEP 3 – CREATE SLOTS */}
          {step === 3 && (
           <CreateSlots
            interviewId={interviewId}
            duration={formData.interviewDuration}
            onDone={(startDate, endDate) => {
              setFormData((prev) => ({
                ...prev,
                slotStartDate: startDate,
                slotEndDate: endDate,
              }));
              setStep(4);
            }}
            onBack={() => setStep(2)}
           />
          )}

          {/* STEP 4 – INTERVIEW LINK */}
          {step === 4 && (
            <InterviewLink
              interviewId={interviewId}
              formData={formData}
              onCreate={() => router.push(`/interview/${interviewId}`)}
              onReset={handleReset}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateInterview;