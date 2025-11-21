import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import CreateInterview from "./CreateInterview"; // ✅ Import your client component

const CreateInterviewPage = async () => {
  const session = await getSession();

  if (!session) redirect("/login");

  return <CreateInterview session={session} />;
};

export default CreateInterviewPage;
