"use client";

import {
  Card,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Phone, Video, Sparkles, ArrowRight, BarChart2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const CreateOptions = () => {
  const router = useRouter();

  return (
    <div className="space-y-6 mt-6">
      {/* ACTION CARDS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* VIDEO INTERVIEW - PRIMARY ACTION */}
        <Card
          onClick={() => router.push("/dashboard/create-interview")}
          className="group relative overflow-hidden p-6 cursor-pointer rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:border-blue-300/50"
        >
          {/* Subtle Background Hover Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="relative flex items-start gap-5">
            {/* Icon Container */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-200 group-hover:scale-105 transition-transform duration-300">
              <Video className="h-6 w-6" />
            </div>

            {/* Content */}
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                  Create AI Interview
                </CardTitle>

                {/* Badge */}
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 border border-blue-100">
                  <Sparkles className="mr-1 h-3 w-3" />
                  AI Powered
                </span>
              </div>

              <CardDescription className="text-slate-500 text-sm leading-relaxed">
                Generate smart, AI-driven interview sessions and assign them to candidates instantly.
              </CardDescription>
            </div>

            {/* Arrow */}
            <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </Card>

        {/* PHONE SCREENING */}
        <Card className="group relative overflow-hidden p-6 cursor-pointer rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:border-indigo-300/50">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="relative flex items-start gap-5">
            {/* Icon */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
              <Phone className="h-6 w-6" />
            </div>

            <div className="flex-1 space-y-1.5">
              <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                Schedule Phone Screening
              </CardTitle>
              <CardDescription className="text-slate-500 text-sm leading-relaxed">
                Organize and schedule manual phone screening calls with candidates seamlessly.
              </CardDescription>
            </div>

            <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </Card>
      </div>

      {/* ANALYTICS SECTION */}
      <Card className="p-6 rounded-2xl bg-white border border-gray-100 shadow-xl">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Recent Candidate Activity</h3>
          <BarChart2 className="h-5 w-5 text-blue-500" />
        </div>

        <div className="mt-4 flex flex-col space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-700">
            <span>Interviews Created (7 Days)</span>
            <span className="font-bold text-lg text-blue-600">42</span>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-700">
            <span>Candidates Screened (Today)</span>
            <span className="font-bold text-lg text-green-600">18</span>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-700">
            <span>Completion Rate</span>
            <span className="font-bold text-lg text-gray-800">89%</span>
          </div>
        </div>

        {/* Mini Bar Chart */}
        <div className="mt-6 h-20 w-full bg-gray-50 rounded-lg flex items-end overflow-hidden p-1">
          <div className="flex w-full h-full items-end justify-around">
            {[20, 60, 40, 80, 50, 70, 90].map((h, i) => (
              <div
                key={i}
                className="w-4 rounded-t-sm transition-all duration-700"
                style={{
                  height: `${h}%`,
                  backgroundColor: i === 6 ? "#3b82f6" : "#93c5fd",
                }}
              ></div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CreateOptions;
