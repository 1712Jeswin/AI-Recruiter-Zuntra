"use client";

import Image from "next/image";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Copy,
  List,
  Calendar,
  Mail,
  MessageSquare,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const InterviewLink = ({
  interviewId,
  formData,
  onReset,
}: {
  interviewId: string;
  formData?: Record<string, any>;
  onReset?: () => void;
}) => {
  const [copied, setCopied] = useState(false);

  const getInterviewUrl = () =>
    `${process.env.NEXT_PUBLIC_HOST_URL}/${interviewId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(getInterviewUrl());
    setCopied(true);
    toast.success("Interview link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = {
    email: `mailto:?subject=AI Interview Invitation&body=Join the interview here: ${getInterviewUrl()}`,
    slack: `https://slack.com/app_redirect?channel=general&message=${encodeURIComponent(
      getInterviewUrl()
    )}`,
    whatsapp: `https://api.whatsapp.com/send?text=Join%20this%20AI%20Interview:%20${encodeURIComponent(
      getInterviewUrl()
    )}`,
  };

  return (
    <div className="flex flex-col items-center justify-center mt-10 px-5">
      {/* Header */}
      <div className="flex flex-col items-center text-center">
        <div className="bg-green-100 p-4 rounded-full">
          <Image src="/check.png" alt="check" width={40} height={40} />
        </div>
        <h2 className="font-semibold text-2xl mt-4 text-gray-900">
          Your AI Interview is Ready!
        </h2>
        <p className="text-gray-600 mt-2">
          Share this link with your candidates to start the interview process
        </p>
      </div>

      {/* Interview Link Card */}
      <div className="w-full md:w-[600px] bg-white shadow-sm border border-gray-200 rounded-xl mt-8 p-6">
        {/* Top Section */}
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium text-gray-900">Interview Link</h3>
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
            Valid for 30 days
          </span>
        </div>

        {/* Link Input + Copy Button */}
        <div className="flex items-center gap-2">
          <Input
            value={getInterviewUrl()}
            readOnly
            className="bg-gray-50 text-black text-base cursor-text"
          />

          <Button
            onClick={handleCopy}
            className="bg-blue-600 hover:bg-blue-700 text-white flex gap-2"
          >
            <Copy className="h-4 w-4" />
            {copied ? "Copied" : "Copy Link"}
          </Button>
        </div>

        <hr className="my-6" />

        {/* Details */}
        <div className="flex flex-wrap items-center gap-6 text-gray-600 text-sm">
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            {formData?.interviewDuration || "30 Minutes"}
          </span>
          <span className="flex items-center gap-2">
            <List className="h-4 w-4 text-gray-500" />
            {formData?.questionCount || "10 Questions"}
          </span>
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            Expires: Nov 20, 2025
          </span>
        </div>
      </div>

      {/* Share Section */}
      <div className="w-full md:w-[600px] mt-6">
        <h3 className="font-medium text-gray-700 mb-3">Share via</h3>
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant="outline"
            className="flex items-center justify-center gap-2 py-4 border-gray-200 hover:bg-gray-50"
            asChild
          >
            <a href={shareLinks.email} target="_blank">
              <Mail className="h-4 w-4 text-gray-700" />
              <span>Email</span>
            </a>
          </Button>

          <Button
            variant="outline"
            className="flex items-center justify-center gap-2 py-4 border-gray-200 hover:bg-gray-50"
            asChild
          >
            <a href={shareLinks.slack} target="_blank">
              <Send className="h-4 w-4 text-gray-700" />
              <span>Slack</span>
            </a>
          </Button>

          <Button
            variant="outline"
            className="flex items-center justify-center gap-2 py-4 border-gray-200 hover:bg-gray-50"
            asChild
          >
            <a href={shareLinks.whatsapp} target="_blank">
              <MessageSquare className="h-4 w-4 text-gray-700" />
              <span>WhatsApp</span>
            </a>
          </Button>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="w-full md:w-[600px] flex justify-between mt-8">
        <Link href={"/dashboard"}>
          <Button
            variant="outline"
            className="text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            ← Back to Dashboard
          </Button>
        </Link>

        <Button
          onClick={() => onReset?.()} // 👈 Reset to Step 1
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          + Create New Interview
        </Button>
      </div>
    </div>
  );
};

export default InterviewLink;
