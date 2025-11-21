"use client";

import { ChangeEvent, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InterviewType } from "@/services/Constants";
import { Button } from "@/components/ui/button";
import { ArrowRight, X, User, UserCheck, UserStar } from "lucide-react";
import { toast } from "sonner";

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

  // ✅ Compute whether all required fields are filled
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

  return (
    <div className="w-full md:w-[95%] bg-white p-6 mt-6 rounded-xl shadow-md border border-slate-200 mx-auto md:mr-3 transition-all duration-300">
      {/* Job Position */}
      <div className="flex flex-col gap-2 relative">
        <label className="text-sm font-medium text-gray-700">
          Job Position <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Input
            placeholder="e.g. Full Stack Developer"
            value={formData.jobPosition || ""}
            onChange={(e) =>
              onHandleInputChange("jobPosition", e.target.value.replace(/^\s+/g, ""))
            }
          />
          {formData.jobPosition && (
            <X
              className="absolute right-3 top-3 text-gray-400 hover:text-red-500 cursor-pointer"
              size={18}
              onClick={() => clearField("jobPosition")}
            />
          )}
        </div>
      </div>

      {/* Job Description */}
      <div className="flex flex-col gap-2 mt-5 relative">
        <label className="text-sm font-medium text-gray-700">
          Job Description <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Textarea
            placeholder="Enter details of the job description"
            className="h-[200px] pr-10"
            value={formData.jobDescription || ""}
            onChange={(e) =>
              onHandleInputChange("jobDescription", e.target.value.replace(/^\s+/g, ""))
            }
          />
          {formData.jobDescription && (
            <X
              className="absolute right-3 top-3 text-gray-400 hover:text-red-500 cursor-pointer"
              size={18}
              onClick={() => clearField("jobDescription")}
            />
          )}
        </div>
      </div>

      {/* Resume Score & Interview Duration */}
      <div className="w-full flex flex-col md:flex-row gap-4 mt-5">
        {/* Resume Score */}
        <div className="flex-1 flex flex-col gap-2 relative">
          <label className="text-sm font-medium text-gray-700">
            Resume Score (0–100)
          </label>
          <div className="relative">
            <Input
              type="number"
              placeholder="e.g. 75"
              value={formData.resumeScore ?? ""}
              min={0}
              max={100}
              onChange={(e) => {
                const value = e.target.value.replace(/\s+/g, "");
                if (value === "" || (/^\d+$/.test(value) && +value >= 0 && +value <= 100)) {
                  onHandleInputChange("resumeScore", value);
                }
              }}
            />
            {formData.resumeScore && (
              <X
                className="absolute right-6 top-3 text-gray-400 hover:text-red-500 cursor-pointer"
                size={18}
                onClick={() => clearField("resumeScore")}
              />
            )}
          </div>
        </div>

        {/* Interview Duration */}
        <div className="flex-1 flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Duration (mins) <span className="text-red-500">*</span>
          </label>
          <Select
            onValueChange={(value: string) =>
              onHandleInputChange("interviewDuration", value === "none" ? null : value)
            }
            value={formData.interviewDuration || ""}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="5 Min">5 Min</SelectItem>
              <SelectItem value="15 Min">15 Min</SelectItem>
              <SelectItem value="30 Min">30 Min</SelectItem>
              <SelectItem value="45 Min">45 Min</SelectItem>
              <SelectItem value="60 Min">60 Min</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Interview Type */}
      <div className="flex flex-col gap-3 mt-5">
        <label className="text-sm font-medium text-gray-700">
          Interview Type <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-3 flex-wrap">
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
              <div
                key={index}
                onClick={toggleType}
                className={`flex gap-2 cursor-pointer items-center border rounded-2xl p-1 px-2 transition-all ${
                  isSelected
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-blue-50 border-gray-200 hover:bg-blue-400 hover:text-white"
                }`}
              >
                <type.icon size={20} />
                <span className="text-sm">{type.title}</span>
                {isSelected && (
                  <X
                    className="ml-1 text-white hover:text-red-200 cursor-pointer"
                    size={14}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleType();
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Experience Level */}
      <div className="flex flex-col gap-3 mt-5">
        <label className="text-sm font-medium text-gray-700">
          Experience Level <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-8 flex-wrap">
          {[
            { level: "Junior", icon: User },
            { level: "Mid", icon: UserCheck },
            { level: "Senior", icon: UserStar },
          ].map(({ level, icon: Icon }) => {
            const isSelected = formData.experienceLevel === level;

            return (
              <div
                key={level}
                onClick={() => onHandleInputChange("experienceLevel", level)}
                className={`flex gap-2 cursor-pointer items-center border rounded-2xl p-1 px-3 transition-all ${
                  isSelected
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-blue-50 border-gray-200 hover:bg-blue-400 hover:text-white"
                }`}
              >
                <Icon size={18} />
                <span className="text-sm">{level}</span>
                {isSelected && (
                  <X
                    className="ml-1 text-white hover:text-red-200 cursor-pointer"
                    size={14}
                    onClick={(e) => {
                      e.stopPropagation();
                      onHandleInputChange("experienceLevel", null);
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* File Upload (Optional) */}
      <div className="flex flex-col gap-2 mt-5">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          Upload Questions (Optional)
        </label>
        <div className="flex items-center gap-3 flex-wrap">
          <Input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="cursor-pointer w-fit"
          />
          {formData.file && (
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-lg border border-gray-200 shadow-sm">
              <span className="text-sm text-gray-700 truncate max-w-[180px]">
                {formData.file.name}
              </span>
              <button
                onClick={handleRemoveFile}
                className="text-red-500 hover:text-red-700"
                title="Remove file"
              >
                <X size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-7 flex justify-end">
        <Button
          className="flex gap-2 items-center"
          onClick={handleSubmit}
          disabled={!isFormValid}
        >
          {formData.file ? "Review Questions" : "Generate Questions"} <ArrowRight />
        </Button>
      </div>
    </div>
  );
};

export default FormContainer;
