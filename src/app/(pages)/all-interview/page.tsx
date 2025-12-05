"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Plus, Loader2, Filter, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { getInterviews } from "../dashboard/actions/getInterviews";
import InterviewItemCard from "../dashboard/_components/InterviewItemCard";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";

// IMPORTANT: Match exactly what InterviewItemCard expects
type Interview = {
  id: string;
  jobPosition: string | null;
  experienceLevel: string | null;
  createdAt: Date;
  expiresAt: Date | null;
  duration?: string | null;
  type?: string[];
  // Other fields can be included but optional (to avoid strict mismatch)
  userId?: string;
  jobDescription?: string | null;
  questionList?: any;
  resumeScore?: number | null;
  userEmail?: string | null;
};

const AllInterviews = () => {
  const router = useRouter();

  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();

  const [interviewList, setInterviewList] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    if (session?.user?.email) {
      getInterviewList();
    } else if (!isSessionLoading && !session) {
      setLoading(false);
    }
  }, [session, isSessionLoading]);

  const getInterviewList = async () => {
    setLoading(true);
    const email = session?.user?.email;

    if (email) {
      const result = await getInterviews(email);

      // Normalize dates to ensure InterviewItemCard receives Date objects
      const normalized = result.map((i: any) => ({
        ...i,
        createdAt: new Date(i.createdAt),
        expiredAt: i.expiredAt ? new Date(i.expiredAt) : null,
      }));

      setInterviewList(normalized);
    }

    setLoading(false);
  };

  // Filter Logic
  const filteredInterviews = interviewList.filter((interview) => {
    if (!filterDate) return true;

    const date = new Date(interview.createdAt);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;

    return formattedDate === filterDate;
  });

  return (
    <div className="my-7">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
          All Interviews
        </h1>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex items-center w-full md:w-auto">
            <Filter className="absolute left-2 h-4 w-4 text-gray-500" />
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="pl-8 pr-3 py-2 h-9 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-48 bg-white"
            />
            {filterDate && (
              <Button
                onClick={() => setFilterDate("")}
                className="absolute right-2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {interviewList?.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              className="h-9"
              onClick={() => router.push("/dashboard/create-interview")}
            >
              <Plus className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Add New</span>
            </Button>
          )}
        </div>
      </div>

      {loading || isSessionLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
        </div>
      ) : (
        <>
          {interviewList?.length === 0 ? (
            <Card className="gap-2 p-5 flex flex-col justify-center items-center h-[300px] border-dashed">
              <Camera className="h-10 w-10 p-2 text-primary bg-blue-100 rounded-full" />
              <h2 className="font-medium text-lg">
                You don't have any interviews created!
              </h2>
              <p className="text-gray-500 text-sm">
                Create your first AI mock interview to get started.
              </p>
              <Button
                className="cursor-pointer mt-3"
                onClick={() => router.push("/dashboard/create-interview")}
              >
                <Plus className="mr-2" /> Create new Interview
              </Button>
            </Card>
          ) : (
            <>
              {filteredInterviews.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <p>No interviews found for this date.</p>
                  <Button
                    variant="link"
                    onClick={() => setFilterDate("")}
                    className="mt-2"
                  >
                    Clear Filter
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-3">
                  {filteredInterviews.map((interview, index) => (
                    <InterviewItemCard key={index} interview={interview} />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AllInterviews;