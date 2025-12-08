"use client";

import { ChangeEvent, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, X, User, UserCheck, UserStar, 
  Upload, Clock, FileText, Check, Code2, 
  Briefcase, Brain, Trophy, AlertCircle, Info
} from "lucide-react";
import { toast } from "sonner";

// Constant for interview types
const InterviewType = [
  { title: 'Technical', icon: Code2 },
  { title: 'Behavioral', icon: User },
  { title: 'Experience', icon: Briefcase },
  { title: 'Problem Solving', icon: Brain },
  { title: 'Leadership', icon: Trophy },
];

interface FormContainerProps {
  formData: Record<string, any>;
  onHandleInputChange: (field: string, value: any) => void;
  GoToNextStep: () => void;
}

const FormContainer = ({
  formData,
  onHandleInputChange,
  GoToNextStep,
}: FormContainerProps) => {
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
      ];

      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error("Invalid file type. Only PDF or Word files are allowed.");
        e.target.value = "";
        return;
      }

      onHandleInputChange("file", selectedFile);
      toast.success(`File "${selectedFile.name}" uploaded successfully.`);
    } else {
      onHandleInputChange("file", null);
    }
  };

  const handleRemoveFile = (): void => {
    onHandleInputChange("file", null);
    toast("File removed.");
  };

  const handleSubmit = (): void => {
    const {
      jobPosition,
      jobDescription,
      interviewDuration,
      interviewType,
      experienceLevel,
    } = formData;

    if (!jobPosition?.trim()) {
      toast.error("Job Position is required.");
      return;
    }

    if (!jobDescription?.trim()) {
      toast.error("Job Description is required.");
      return;
    }

    if (!interviewDuration) {
      toast.error("Interview Duration is required.");
      return;
    }

    if (!interviewType || interviewType.length === 0) {
      toast.error("Select at least one Interview Type.");
      return;
    }

    if (!experienceLevel) {
      toast.error("Select an Experience Level.");
      return;
    }

    toast.success("All required details added successfully!");
    GoToNextStep();
  };

  const clearField = (field: string) => onHandleInputChange(field, null);

  const isFormValid = useMemo(() => {
    return (
      formData.jobPosition?.trim() &&
      formData.jobDescription?.trim() &&
      formData.interviewDuration &&
      formData.experienceLevel &&
      Array.isArray(formData.interviewType) &&
      formData.interviewType.length > 0
    );
  }, [formData]);

  const handleDownloadSample = async () => {
    try {
      const { Document, Packer, Paragraph } = await import("docx");
      const saveAs = (await import("file-saver")).default;

      const questions = [
        "1. Can you briefly introduce yourself and walk me through your professional background?",
        "2. What are the key strengths you bring to this role, and how have you demonstrated them in past projects?",
        "3. Describe a challenging situation you faced at work and how you handled it.",
        "4. Can you explain a project you are most proud of and the impact it created?",
        "5. How do you approach problem-solving when you encounter an unexpected issue?",
        "6. Tell me about a time you had to collaborate with a team — what was your role and contribution?",
        "7. How do you prioritize tasks when managing multiple deadlines?",
        "8. Describe a situation where you received critical feedback. How did you respond?",
        "9. What motivates you in a professional environment, and what kind of work culture helps you perform best?",
        "10. Why are you interested in this position, and how do you see yourself growing in this role?",
      ];

      const doc = new Document({
        sections: [{ children: questions.map(q => new Paragraph(q)) }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, "sample-interview-questions.docx");
      toast.success("Sample questions downloaded.");
    } catch (error) {
      console.error("Error generating document:", error);
      toast.error("Failed to generate sample file.");
    }
  };

  return (
    // Updated container width to max-w-6xl for wider screens and added responsive padding
    <div className="w-full max-w-6xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-4 md:my-8 transition-all duration-300 font-sans text-slate-800">
      
      {/* Header */}
      <div className="px-4 py-4 md:px-8 md:py-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Create Interview Assessment</h2>
          <p className="text-xs md:text-sm text-slate-500 mt-1">Configure the parameters to generate tailored interview questions.</p>
        </div>
        <div className="hidden sm:block">
           <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
             <Briefcase size={20} />
           </div>
        </div>
      </div>

      <div className="p-4 md:p-8 space-y-6 md:space-y-8">
        
        {/* Job Details Section */}
        <div className="grid grid-cols-1 gap-6">
          
          {/* Job Position */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between items-center">
              <span>Job Position <span className="text-red-500">*</span></span>
              {formData.jobPosition && (
                <button onClick={() => clearField("jobPosition")} className="text-slate-400 hover:text-red-500 text-xs lowercase font-normal flex items-center gap-1 transition-colors">
                  <X size={12} /> clear
                </button>
              )}
            </label>
            <input 
              type="text" 
              placeholder="e.g. Senior Full Stack Developer" 
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              value={formData.jobPosition || ""}
              onChange={(e) => onHandleInputChange("jobPosition", e.target.value.replace(/^\s+/g, ""))}
            />
          </div>
          
          {/* Job Description */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between items-center">
              <span>Job Description <span className="text-red-500">*</span></span>
              {formData.jobDescription && (
                <button onClick={() => clearField("jobDescription")} className="text-slate-400 hover:text-red-500 text-xs lowercase font-normal flex items-center gap-1 transition-colors">
                  <X size={12} /> clear
                </button>
              )}
            </label>
            <textarea 
              placeholder="Paste the job description or requirements here..." 
              className="w-full px-4 py-3 h-32 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none shadow-sm"
              value={formData.jobDescription || ""}
              onChange={(e) => onHandleInputChange("jobDescription", e.target.value.replace(/^\s+/g, ""))}
            />
          </div>
        </div>

        {/* Configuration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          
          {/* Resume Score */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resume Score Threshold</label>
            <div className="relative">
              <input 
                type="number" 
                min="0" 
                max="100" 
                placeholder="e.g. 75" 
                className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                value={formData.resumeScore ?? ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/\s+/g, "");
                  if (value === "" || (/^\d+$/.test(value) && +value >= 0 && +value <= 100)) {
                    onHandleInputChange("resumeScore", value);
                  }
                }}
              />
              <span className="absolute right-4 top-3.5 text-slate-400 text-sm font-medium">/ 100</span>
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Duration <span className="text-red-500">*</span></label>
            <div className="relative">
              <select 
                className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none transition-all cursor-pointer invalid:text-slate-400 shadow-sm"
                value={formData.interviewDuration || ""}
                onChange={(e) => onHandleInputChange("interviewDuration", e.target.value === "none" ? null : e.target.value)}
              >
                <option value="" disabled>Select duration</option>
                <option value="5 Min">5 Min</option>
                <option value="15 Min">15 Min</option>
                <option value="30 Min">30 Min</option>
                <option value="45 Min">45 Min</option>
                <option value="60 Min">60 Min</option>
              </select>
              <Clock size={16} className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Interview Type Selection */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Interview Type <span className="text-red-500">*</span></label>
          <div className="flex flex-wrap gap-2 md:gap-3">
            {InterviewType.map((type: any, index: number) => {
              const isSelected = Array.isArray(formData.interviewType)
                ? formData.interviewType.includes(type.title)
                : false;

              const toggleType = () => {
                let updatedTypes: string[] = Array.isArray(formData.interviewType)
                  ? [...formData.interviewType]
                  : [];

                if (isSelected) {
                  updatedTypes = updatedTypes.filter((t) => t !== type.title);
                } else {
                  updatedTypes.push(type.title);
                }
                onHandleInputChange("interviewType", updatedTypes);
              };

              return (
                <button
                  key={index}
                  onClick={toggleType}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border group ${
                    isSelected 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20' 
                      : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 shadow-sm'
                  }`}
                >
                  <type.icon size={16} className={isSelected ? 'text-white' : 'text-slate-500 group-hover:text-blue-600'} />
                  {type.title}
                  {isSelected && <Check size={14} className="ml-1 opacity-70" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Experience Level Selection */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Experience Level <span className="text-red-500">*</span></label>
          <div className="flex flex-wrap gap-2 md:gap-3">
            {[
              { level: "Junior", icon: User },
              { level: "Mid", icon: UserCheck },
              { level: "Senior", icon: UserStar },
            ].map(({ level, icon: Icon }) => {
              const isSelected = formData.experienceLevel === level;
              return (
                <button
                  key={level}
                  onClick={() => onHandleInputChange("experienceLevel", isSelected ? null : level)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border group ${
                    isSelected 
                      ? 'bg-slate-800 border-slate-800 text-white shadow-md' 
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 shadow-sm'
                  }`}
                >
                  <Icon size={16} className={isSelected ? 'text-white' : 'text-slate-500'} />
                  {level}
                </button>
              );
            })}
          </div>
        </div>

        {/* File Upload Section */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Upload Questions (Optional)
            </label>
            <button
              type="button"
              onClick={handleDownloadSample}
              className="text-xs text-blue-600 hover:underline hover:text-blue-800 transition flex items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m7-7H5" />
              </svg>
              Download sample .docx
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* NOTE 1: Minimum Requirement */}
            <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200/60 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 leading-relaxed">
                <span className="font-bold text-amber-900">Important:</span> Your file must contain at least <span className="font-bold">30 valid questions</span>.
              </p>
            </div>

            {/* NOTE 2: Format Guideline */}
            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200/60 rounded-lg">
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800 leading-relaxed">
                <span className="font-bold text-blue-900">Note:</span> The file must contain <span className="font-bold">questions only</span>—no answers or explanations.
              </p>
            </div>
          </div>

          {!formData.file ? (
            <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-blue-400/50 transition-all cursor-pointer group bg-slate-50/30">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="p-4 bg-blue-50 text-blue-600 rounded-full mb-3 group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-200">
                <Upload size={24} />
              </div>
              <p className="text-sm text-slate-700 font-semibold group-hover:text-blue-700 transition-colors">Click to upload or drag and drop</p>
              <p className="text-xs text-slate-400 mt-1">PDF or Word files (DOC/DOCX)</p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white text-blue-600 rounded-lg border border-blue-100 shadow-sm">
                  <FileText size={24} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-md">
                    {formData.file.name}
                  </p>
                  <p className="text-xs text-blue-600 font-medium mt-0.5">Ready for upload</p>
                </div>
              </div>
              <button
                onClick={handleRemoveFile}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Remove file"
              >
                <X size={20} />
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Footer */}
      <div className="px-4 py-4 md:px-8 md:py-6 bg-slate-50 border-t border-slate-200 flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid}
          className={`flex items-center gap-2 px-8 py-6 rounded-lg font-semibold text-sm shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 focus:ring-4 ${
            isFormValid 
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/10 focus:ring-blue-500/20" 
              : "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
          }`}
        >
          {formData.file ? "Review Questions" : "Generate Questions"}
          <ArrowRight size={18} />
        </Button>
      </div>
    </div>
  );
};

export default FormContainer;