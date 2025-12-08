"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Filter, X, Camera, Plus, Pin } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

import { getInterviews } from "../dashboard/actions/getInterviews";
import InterviewItemCard from "../dashboard/_components/InterviewItemCard";
import { authClient } from "@/lib/auth-client";

import { Input } from "@/components/ui/input";

type Interview = {
  id: string;
  jobPosition: string | null;
  experienceLevel: string | null;
  createdAt: Date;
  expiresAt: Date | null;
  duration?: string | null;
  type?: string[];
};

export default function ScheduledInterviews() {
  const router = useRouter();

  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();

  const [interviewList, setInterviewList] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState("");

  // FETCH INTERVIEWS
  const getInterviewList = useCallback(async () => {
    setLoading(true);
    const email = session?.user?.email;

    if (email) {
      const result = await getInterviews(email);
      const normalized = result.map((i: any) => ({
        ...i,
        createdAt: new Date(i.createdAt),
        expiresAt: i.expiresAt ? new Date(i.expiresAt) : null,
      }));

      setInterviewList(normalized);
    }

    setLoading(false);
  }, [session?.user?.email]);

  useEffect(() => {
    if (session?.user?.email) {
      getInterviewList();
    } else if (!isSessionLoading && !session) {
      setLoading(false);
    }
  }, [session, isSessionLoading, getInterviewList]);

  // FILTER BY DATE
  const filteredInterviews = interviewList.filter((interview) => {
    if (!filterDate) return true;
    const date = interview.createdAt;
    const formatted = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return formatted === filterDate;
  });

  return (
    <div className="my-7">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            Scheduled Interviews
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Manage your upcoming candidate evaluations.
          </p>
        </div>

        {/* DATE FILTER + ADD NEW */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex items-center w-full md:w-auto">
            <Filter className="absolute left-2 h-4 w-4 text-gray-500" />
            <Input
              type="date"
              className="pl-8 pr-3 py-2 h-9 border rounded-md text-sm w-full md:w-48"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
            {filterDate && (
              <Button
                onClick={() => setFilterDate("")}
                className="absolute right-2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </Button>
            )}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push("/dashboard/create-interview")}
          >
            <Plus className="h-4 w-4 md:mr-1" />
            <span className="hidden md:inline">Add New</span>
          </Button>
        </div>
      </div>

      {/* PAGE CONTENT */}
      {loading || isSessionLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
        </div>
      ) : (
        <>
          {interviewList.length === 0 ? (
            // EMPTY STATE
            <Card className="p-5 flex flex-col justify-center items-center h-[300px] border-dashed">
              <Camera className="h-10 w-10 p-2 text-primary bg-blue-100 rounded-full" />
              <h2 className="font-medium text-lg mt-2">
                You don't have any interviews created!
              </h2>
              <p className="text-gray-500 text-sm">
                Create your first AI-powered interview to get started.
              </p>
              <Button
                className="mt-4"
                onClick={() => router.push("/dashboard/create-interview")}
              >
                <Plus className="mr-2" /> Create Interview
              </Button>
            </Card>
          ) : (
            <>
              {/* TIP BANNER */}
              <div className="mb-8 flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-800 text-sm">
                <Pin className="mt-0.5 text-blue-500" />
                <div>
                  <span className="font-semibold">Tip:</span> Click a card to
                  view full results, history, and detailed evaluation.
                </div>
              </div>

              {/* INTERVIEW CARDS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredInterviews.map((interview) => (
                  <div
                    key={interview.id}
                    onClick={() =>
                      router.push(`/dashboard/interview/${interview.id}`)
                    }
                    className="cursor-pointer"
                  >
                    <InterviewItemCard interview={interview} />
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
