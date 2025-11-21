import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import {redirect} from "next/navigation";
import Link from "next/link";

const LandingPage = async () => {
  const session = await getSession();

  if(session) redirect("/dashboard")
  return (
    <div className="flex flex-col gap-1 justify-center items-center h-screen w-screen">
      <h1>This is the Landing page</h1>
      <Link href="/login">
        <Button>Login</Button>
      </Link>
    </div>
  );
};
export default LandingPage;
