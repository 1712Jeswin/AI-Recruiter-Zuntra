"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Phone, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const CreateOptions = () => {
  const router = useRouter();
  return (
    <div className="grid grid-cols-2 gap-5">
      <Card
        className="py-4 px-8 lg:px-12 gap-2 cursor-pointer bg-gradient-to-r from-blue-50 to-slate-100 shadow-md"
        onClick={() => router.push("dashboard/create-interview")}
      >
        <Video className="p-2 text-primary bg-blue-100 rounded-full h-11 w-11" />
        <CardTitle className="p-0 m-0">Create new Interview</CardTitle>
        <CardDescription className="text-gray-600 p-0 mt-0">
          Create AI Interviews and Schedule them for Candidates
        </CardDescription>
      </Card>
      <Card className="py-4 px-8 lg:px-12 gap-2 bg-gradient-to-r from-blue-50 to-slate-100 shadow-md">
        <Phone className="p-2 text-primary bg-blue-100 rounded-full h-11 w-11" />
        <CardTitle className="p-0 m-0">Create new Interview</CardTitle>
        <CardDescription className="text-gray-600 p-0 mt-0">
          Schedule phone screening call with Candidates
        </CardDescription>
      </Card>
    </div>
  );
};

export default CreateOptions;