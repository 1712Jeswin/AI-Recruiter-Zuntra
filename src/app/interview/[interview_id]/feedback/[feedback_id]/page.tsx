"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function FeedbackPage() {
  const { feedback_id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/feedback/${feedback_id}`);
      const json = await res.json();
      setData(json);
      setLoading(false);
    }

    load();
  }, [feedback_id]);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center text-lg font-semibold">
        Loading feedback…
      </div>
    );
  }

  if (!data || data.error) {
    return (
      <div className="p-6 text-center text-red-500 font-semibold">
        Feedback not found.
      </div>
    );
  }

  const report = data.fullReport;

  const scoreBlocks = [
    { label: "Overall Score", value: data.overallScore },
    { label: "Tone & Style", value: data.toneStyleScore },
    { label: "Content", value: data.contentScore },
    { label: "Structure", value: data.structureScore },
    { label: "Skills Match", value: data.skillsScore },
    { label: "ATS Score", value: data.atsScore },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Resume Analysis Result</h1>

      {/* Score Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {scoreBlocks.map((s, i) => (
          <Card key={i} className="border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{s.value}/100</span>
              </div>
              <Progress value={s.value} className="h-3" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Sections */}
      <Section title="Tone & Style" data={report.toneStyle} />
      <Section title="Content Quality" data={report.content} />
      <Section title="Structure & Formatting" data={report.structure} />
      <Section title="Skills Evaluation" data={report.skills} />

      {/* ATS Keywords */}
      <Card>
        <CardHeader>
          <CardTitle>ATS Recommended Keywords</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {report.ats.recommendedKeywords.map((kw: string, idx: number) => (
            <Badge key={idx} variant="secondary">
              {kw}
            </Badge>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Section({ title, data }: { title: string; data: any }) {
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Strengths</h3>
          <ul className="list-disc ml-6 text-gray-700">
            {data.strengths.map((s: string, i: number) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Improvements</h3>
          <ul className="list-disc ml-6 text-gray-700">
            {data.improvements.map((s: string, i: number) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
