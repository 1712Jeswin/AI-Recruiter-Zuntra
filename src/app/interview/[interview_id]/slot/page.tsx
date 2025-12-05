// app/interview/[interview_id]/slot/page.tsx (SERVER COMPONENT)

import SlotPageClient from "../../_components/SlotPageClient";

export default async function Page(
  props: { params: Promise<{ interview_id: string }> }
) {
  const { interview_id } = await props.params;

  return <SlotPageClient interviewId={interview_id} />;
}