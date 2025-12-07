import { NextResponse } from "next/server";
import { db } from "@/db";
import { interview, resumeQuestions } from "@/db/schema";
import { eq } from "drizzle-orm";

type ResumeQuestion = {
  question: string;
  [key: string]: any;
};

type InterviewQuestion = {
  question: string;
  type: string;
  [key: string]: any;
};

// ---------------------------------------------
// CATEGORY → IDEAL TIMER (seconds)
// ---------------------------------------------
const TIMER_MAP: Record<string, number> = {
  technical: 120,
  behavioral: 150,
  experience: 120,
  "problem solving": 180,
  leadership: 150,
  resume: 90,
};

// Used to decide which questions lose time first
const PRIORITY = [
  "resume",
  "experience",
  "technical",
  "behavioral",
  "leadership",
  "problem solving",
];

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Fetch interview
  const [interviewRow] = await db
    .select()
    .from(interview)
    .where(eq(interview.id, id));

  if (!interviewRow) {
    return NextResponse.json({ error: "Interview not found" }, { status: 404 });
  }

  // Fetch resume questions
  const [resumeRow] = await db
    .select()
    .from(resumeQuestions)
    .where(eq(resumeQuestions.interviewId, id));

  const resumeQs: ResumeQuestion[] = Array.isArray(resumeRow?.questions)
    ? (resumeRow.questions as ResumeQuestion[])
    : [];

  const interviewQs: InterviewQuestion[] = Array.isArray(
    interviewRow.questionList
  )
    ? (interviewRow.questionList as InterviewQuestion[])
    : [];

  // ---------------------------------------------
  // RANDOM SHUFFLE
  // ---------------------------------------------
  function shuffle<T>(array: T[]): T[] {
    return [...array].sort(() => Math.random() - 0.5);
  }

  const shuffledResumeQs = shuffle(resumeQs);

  // ---------------------------------------------
  // DURATION → MAX QUESTIONS
  // ---------------------------------------------
  const durationMap: Record<string, number> = {
    "15": 3,
    "30": 6,
    "45": 9,
    "60": 12,
  };

  const durationKey = String(interviewRow.duration);
  const maxQuestions = durationMap[durationKey] ?? 6;

  // Resume Q slice
  const finalResumeQs = shuffledResumeQs.slice(0, maxQuestions);
  let remaining = maxQuestions - finalResumeQs.length;

  // ---------------------------------------------
  // FILTER TYPE QUESTIONS
  // ---------------------------------------------
  const selectedTypes: string[] = Array.isArray(interviewRow.type)
    ? (interviewRow.type as string[])
    : [];

  const filteredInterviewQs = interviewQs.filter((q) =>
    selectedTypes.includes(q.type)
  );

  const groupedByType: Record<string, InterviewQuestion[]> = {};
  for (const q of filteredInterviewQs) {
    if (!groupedByType[q.type]) groupedByType[q.type] = [];
    groupedByType[q.type].push(q);
  }

  for (const type of Object.keys(groupedByType)) {
    groupedByType[type] = shuffle(groupedByType[type]);
  }

  const availableTypes = selectedTypes.filter(
    (type) => groupedByType[type]?.length > 0
  );

  const perType =
    availableTypes.length > 0
      ? Math.ceil(remaining / availableTypes.length)
      : remaining;

  let balancedInterviewQs: InterviewQuestion[] = [];

  for (const type of availableTypes) {
    if (remaining <= 0) break;
    const pick = groupedByType[type].slice(0, perType);
    balancedInterviewQs.push(...pick);
    remaining -= pick.length;
  }

  if (remaining > 0) {
    const leftoverPool = shuffle(
      filteredInterviewQs.filter(
        (q) => !balancedInterviewQs.some((x) => x.question === q.question)
      )
    );
    balancedInterviewQs.push(...leftoverPool.slice(0, remaining));
  }

  balancedInterviewQs = shuffle(balancedInterviewQs);

  // ---------------------------------------------
  // FORMAT INTERVIEW QUESTIONS + ADD TIMER
  // ---------------------------------------------
  const finalInterviewQs = balancedInterviewQs.map((qObj, i) => ({
    id: `interview-${i}`,
    question: qObj.question,
    type: qObj.type,
    timer: TIMER_MAP[qObj.type.toLowerCase()] ?? 120,
  }));

  // ---------------------------------------------
  // MERGE ALL QUESTIONS
  // ---------------------------------------------
  let finalQuestions = [
    ...finalResumeQs.map((qObj, i) => ({
      id: `resume-${i}`,
      question: qObj.question,
      type: "resume",
      timer: TIMER_MAP["resume"],
    })),
    ...finalInterviewQs,
  ];

  finalQuestions = shuffle(finalQuestions);

  // ---------------------------------------------
  // LIMIT TOTAL TIME TO INTERVIEW DURATION
  // ---------------------------------------------
  const TOTAL_ALLOWED = Number(interviewRow.duration) * 60; // convert minutes → seconds

  // Compute current time
  let totalTime = finalQuestions.reduce((sum, q) => sum + q.timer, 0);

  // 1️⃣ Reduce timers proportionally by priority
  if (totalTime > TOTAL_ALLOWED) {
    for (const type of PRIORITY) {
      const qs = finalQuestions.filter(
        (q) => q.type.toLowerCase() === type
      );

      for (const q of qs) {
        if (totalTime <= TOTAL_ALLOWED) break;

        const old = q.timer;
        const reduced = Math.max(30, Math.floor(old * 0.7)); // reduce 30%

        q.timer = reduced;
        totalTime -= (old - reduced);
      }
    }
  }

  // 2️⃣ If still above limit → remove questions by priority
  if (totalTime > TOTAL_ALLOWED) {
    for (const type of PRIORITY) {
      if (totalTime <= TOTAL_ALLOWED) break;

      const indexes = finalQuestions
        .map((q, idx) => ({ q, idx }))
        .filter((x) => x.q.type.toLowerCase() === type)
        .map((x) => x.idx)
        .reverse();

      for (const idx of indexes) {
        if (totalTime <= TOTAL_ALLOWED) break;

        totalTime -= finalQuestions[idx].timer;
        finalQuestions.splice(idx, 1);
      }
    }
  }

  return NextResponse.json(finalQuestions);
}
