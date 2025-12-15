import { redirect } from "next/navigation";
import InterviewClientWrapper from "./InterviewClientWrapper";

export default async function StartPage({
  params,
  searchParams,
}: {
  params: Promise<{ interview_id: string }>;
  searchParams: Promise<{ candidateId?: string }>;
}) {
  const { interview_id } = await params;
  const { candidateId = "" } = await searchParams;

  if (!candidateId) {
    redirect(`/interview/${interview_id}?error=missing-candidate`);
  }

  if (!interview_id) redirect("/not-found");

  // -----------------------------
  // ✅ USE ABSOLUTE URL FOR SERVER FETCH
  // -----------------------------
  const baseUrl = process.env.NEXT_PUBLIC_HOST_URL;
  if (!baseUrl) {
    throw new Error("❌ NEXT_PUBLIC_HOST_URL is missing in .env");
  }

  // ---- SAFE FETCH BOOKING ----
  const bookingRes = await fetch(
    `${baseUrl}/api/bookings/get-time?interview_id=${interview_id}`,
    { cache: "no-store" }
  );

  if (!bookingRes.ok) redirect("/not-found");

  const booking = await bookingRes.json();

  if (!booking?.start) redirect("/not-found");

  const now = Date.now();
  const startTime = new Date(booking.start).getTime();

  if (isNaN(startTime)) redirect(`/error?msg=Invalid start time`);

  if (now < startTime) {
    redirect(`/scheduled/${interview_id}?error=not-started`);
  }

  // ---- FETCH SESSION STATUS ----
  const statusRes = await fetch(
    `${baseUrl}/api/interview/${interview_id}/session-status?candidateId=${candidateId}`,
    { cache: "no-store" }
  );

  const status = statusRes.ok ? await statusRes.json() : null;

  if (status?.status === "completed") {
    redirect(`/interview/${interview_id}/done`);
  }

  return (
    <InterviewClientWrapper
      interviewId={interview_id}
      candidateId={candidateId}
    />
  );
}


// import { redirect } from "next/navigation";
// import InterviewClientWrapper from "./InterviewClientWrapper";

// export default async function StartPage({
//   params,
//   searchParams,
// }: {
//   params: Promise<{ interview_id: string }>;
//   searchParams: Promise<{ candidateId?: string }>;
// }) {
//   const { interview_id } = await params;
//   const { candidateId = "" } = await searchParams;

  // ⛔️ All protection removed — always allow interview to load
  // NO redirect for missing candidate
  // NO redirect for invalid booking
  // NO redirect for early start
  // NO redirect for completed session

  // return (
  //   <InterviewClientWrapper
  //     interviewId={interview_id}
  //     candidateId={candidateId || "TEST-CANDIDATE"}
  //   />
  // );
// }
