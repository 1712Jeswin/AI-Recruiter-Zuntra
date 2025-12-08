"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from "@/components/ui/card";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { Trophy, Medal, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type LeaderItem = {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  overallScore: number;
  interviewId: string;
};

export default function Leaderboard({ data }: { data: LeaderItem[] }) {
  const router = useRouter();

  if (!data || data.length === 0) return null;

  const rankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="text-yellow-500" size={18} />;
      case 2:
        return <Medal className="text-gray-400" size={18} />;
      case 3:
        return <Award className="text-orange-600" size={18} />;
      default:
        return null;
    }
  };

  return (
    <Card className="mt-10 border-blue-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <Trophy className="text-yellow-500" /> Interview Leaderboard
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Rank</TableHead>
              <TableHead>Candidate</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.map((entry, index) => (
              <TableRow key={entry.candidateId} className="hover:bg-blue-50/50">
                
                {/* RANK */}
                <TableCell className="font-medium flex items-center gap-2">
                  {rankIcon(index + 1)} #{index + 1}
                </TableCell>

                {/* NAME + AVATAR */}
                <TableCell className="flex items-center gap-3">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback>
                      {entry.candidateName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {entry.candidateName}
                </TableCell>

                {/* EMAIL */}
                <TableCell>{entry.candidateEmail}</TableCell>

                {/* SCORE */}
                <TableCell className="text-right">
                  <Badge
                    className={
                      entry.overallScore >= 85
                        ? "bg-green-100 text-green-700"
                        : entry.overallScore >= 70
                        ? "bg-blue-100 text-blue-700"
                        : entry.overallScore >= 50
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }
                  >
                    {entry.overallScore}%
                  </Badge>
                </TableCell>

                {/* DETAILS BUTTON */}
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    onClick={() =>
                      router.push(
                        `/interview/${entry.interviewId}/candidates/${entry.candidateId}`
                      )
                    }
                  >
                    Details
                  </Button>
                </TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
