"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Copy,
  Send,
  Tag,
  Mail,
  MessageCircle,
  Slack,
} from "lucide-react";
import React from "react";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface InterviewItemCardProps {
  interview: {
    id: string;
    jobPosition: string | null;
    experienceLevel: string | null;
    createdAt: Date;
    expiresAt: Date | null;
    duration?: string | null;
    type?: string[]; // tags array
  };
}

// Tag Color System (matching screenshot style)
const getTagColor = (type: string) => {
  switch (type) {
    case "Technical":
      return { bg: "bg-green-100", text: "text-green-700" };
    case "Behavioral":
      return { bg: "bg-pink-100", text: "text-pink-700" };
    case "Experience":
      return { bg: "bg-blue-100", text: "text-blue-700" };
    case "Problem Solving":
      return { bg: "bg-yellow-100", text: "text-yellow-700" };
    case "Leadership":
      return { bg: "bg-purple-100", text: "text-purple-700" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-700" };
  }
};

const InterviewItemCard = ({ interview }: InterviewItemCardProps) => {
  const shareUrl = `${process.env.NEXT_PUBLIC_HOST_URL}/${interview.id}`;

  const onCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };

  const onShareWhatsApp = () => {
    const text = `Check out this mock interview for ${interview.jobPosition}: ${shareUrl}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const onShareEmail = () => {
    const subject = `Interview Link: ${interview.jobPosition}`;
    const body = `Here is the mock interview link for ${interview.jobPosition}: ${shareUrl}`;
    const url = `mailto:?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.open(url, "_blank");
  };

  const onShareSlack = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied! You can now paste it in Slack.");
  };

  return (
    <Card className="p-6 rounded-2xl bg-white border border-gray-100 shadow-md hover:shadow-lg transition-all duration-200 flex flex-col">
      {/* Top Row */}
      <div className="flex justify-between items-start mb-4">
        {/* Tag Section with Icon */}
        <div className="flex items-center space-x-2">
          <Tag className="h-4 w-4 text-gray-400" />

          {Array.isArray(interview.type) && interview.type.length > 0 && (
            <div className="flex flex-wrap items-center gap-1">
              {interview.type.map((tag, idx) => {
                const colors = getTagColor(tag);
                return (
                  <span
                    key={idx}
                    className={`${colors.bg} ${colors.text} text-xs font-medium px-2.5 py-0.5 rounded-full`}
                  >
                    {tag}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Date */}
        {/* <span className="text-xs font-medium text-gray-500">
                    {new Date(interview.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                    })}
                </span> */}
        <div className="flex flex-col items-end">
          {/* Date */}
          <span className="text-xs font-medium text-gray-500">
            {new Date(interview.createdAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>

          {/* ACTIVE / EXPIRED TAG */}
          {interview.expiresAt &&
            (new Date(interview.expiresAt) < new Date() ? (
              <span
                className="mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full 
                    bg-red-100 text-red-700 animate-pulse shadow-sm"
              >
                EXPIRED
              </span>
            ) : (
              <span
                className="mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full 
                    bg-green-200 text-green-700 shadow-sm"
              >
                ACTIVE
              </span>
            ))}
        </div>
      </div>

      {/* Title & Info */}
      <div className="flex-grow">
        <h3 className="text-xl font-bold text-gray-900">
          {interview.jobPosition || "Untitled Position"}
        </h3>

        <p className="mt-1 text-sm text-gray-600">
          <span className="font-semibold">
            {interview.duration || "15 Min"}
          </span>
          {" • "}
          <span className="text-gray-500">
            {interview.experienceLevel || "Mid-Level"}
          </span>
        </p>
      </div>

      {/* Footer Buttons */}
      <div className="mt-5 pt-4 border-t border-gray-100 flex space-x-3">
        {/* Copy Link */}
        <button
          onClick={onCopyLink}
          className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition"
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy Link
        </button>

        {/* Send Button with Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium 
                            text-white rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 
                            shadow-md hover:shadow-lg hover:scale-[1.01] transition"
            >
              <Send className="h-4 w-4 mr-2" />
              Send
            </button>
          </PopoverTrigger>

          <PopoverContent className="w-48 p-2" align="end">
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                className="justify-start h-8 text-sm"
                onClick={onShareWhatsApp}
              >
                <MessageCircle className="h-4 w-4 mr-2 text-green-500" />
                WhatsApp
              </Button>
              <Button
                variant="ghost"
                className="justify-start h-8 text-sm"
                onClick={onShareEmail}
              >
                <Mail className="h-4 w-4 mr-2 text-blue-500" />
                Email
              </Button>
              <Button
                variant="ghost"
                className="justify-start h-8 text-sm"
                onClick={onShareSlack}
              >
                <Slack className="h-4 w-4 mr-2 text-purple-500" />
                Slack (Copy)
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </Card>
  );
};

export default InterviewItemCard;