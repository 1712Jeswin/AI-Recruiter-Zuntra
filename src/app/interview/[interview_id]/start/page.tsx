// import { redirect } from "next/navigation";
// import InterviewClientWrapper from "./InterviewClientWrapper";

// interface StartPageProps {
//   params: {
//     interview_id: string;
//   };
//   searchParams?: {
//     candidateId?: string;
//     [key: string]: string | undefined;
//   };
// }

// export default async function StartPage({ params, searchParams }: StartPageProps) {
//   const interviewId = params.interview_id;
//   const candidateId = searchParams?.candidateId ?? "";


//   // Always validate required data
//   if (!interviewId) {
//     redirect("/not-found");
//   }

//   // ---- FETCH BOOKING SECURELY (SERVER-SIDE) ----
//   const res = await fetch(
//     `${process.env.NEXT_PUBLIC_BASE_URL}/api/bookings/get-time?interview_id=${interviewId}`,
//     { cache: "no-store" }
//   );

//   if (!res.ok) {
//     redirect("/not-found");
//   }

//   const booking = await res.json();

//   if (!booking?.start) {
//     redirect("/not-found");
//   }

//   // ---- TIME VALIDATION ----
//   const now = Date.now();
//   const startTime = new Date(booking.start).getTime();

//   if (isNaN(startTime)) {
//     redirect(`/error?msg=Invalid start time`);
//   }

//   // ⛔ BLOCK IF INTERVIEW HAS NOT STARTED
//   if (now < startTime) {
//     redirect(`/scheduled/${interviewId}?error=not-started`);
//   }

//   // ---- CHECK SESSION STATUS ----
//   const statusRes = await fetch(
//     `${process.env.NEXT_PUBLIC_BASE_URL}/api/interview/${interviewId}/session-status?candidateId=${candidateId}`,
//     { cache: "no-store" }
//   );

//   const status = statusRes.ok ? await statusRes.json() : null;

//   if (status?.status === "completed") {
//     redirect(`/interview/${interviewId}/done`);
//   }

//   // ---- SAFE: INTERVIEW ALLOWED ----
//   return (
//     <InterviewClientWrapper
//       interviewId={interviewId}
//       candidateId={candidateId}
//     />
//   );
// }


import { redirect } from "next/navigation";
import InterviewClientWrapper from "./InterviewClientWrapper";
// interface StartPageProps {
//   params: { interview_id: string };
//   searchParams?: {
//     candidateId?: string;
//   };
// }

export default async function StartPage({
  params,
  searchParams,
}: {
  params: Promise<{ interview_id: string }>;
  searchParams: Promise<{ candidateId?: string }>;
}) {
  const { interview_id } = await params;
  const { candidateId = "" } = await searchParams;


  if (!interview_id) redirect("/not-found");

  // ---- SAFE FETCH BOOKING ----
  const res = await fetch(
    `/api/bookings/get-time?interview_id=${interview_id}`,
    { cache: "no-store" }
  );

  if (!res.ok) redirect("/not-found");

  const booking = await res.json();

  if (!booking?.start) redirect("/not-found");

  const now = Date.now();
  const startTime = new Date(booking.start).getTime();

  if (isNaN(startTime)) redirect(`/error?msg=Invalid start time`);

  if (now < startTime) {
    redirect(`/scheduled/${interview_id}?error=not-started`);
  }

  // ---- FETCH SESSION STATUS ----
  const statusRes = await fetch(
    `/api/interview/${interview_id}/session-status?candidateId=${candidateId}`,
    { cache: "no-store" }
  );

  const status = statusRes.ok ? await statusRes.json() : null;

  if (status?.status === "completed") {
    redirect(`/interview/${interview_id}/done`);
  }

  return (
    <InterviewClientWrapper interviewId={interview_id} candidateId={candidateId} />
  );
}

