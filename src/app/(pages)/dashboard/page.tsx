import { getSession } from "@/lib/auth";
import {redirect} from "next/navigation";
import CreateOptions from "./_components/CreateOptions";
import LatestInterviewsList from "./_components/LatestInterviewsList";

const Dashboard = async () => {
  const session = await getSession();
  if(!session) redirect("/login")
  const user = session.user;
  return (
    <div>
      {/* <WelcomeContainer /> */}
      <h2 className="text-2xl font-semibold my-4">Dashboard</h2>
      <CreateOptions />
      <LatestInterviewsList />
    </div>
  );
};

export default Dashboard;
