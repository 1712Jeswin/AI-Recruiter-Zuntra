"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

export const SignOutButton = () => {
  const router = useRouter();

  const signout = async () =>
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.push("/"),
      },
    });
  return (
    <Button onClick={signout} variant="outline" className="transition-all duration-200 hover:pointer hover:bg-blue-500 hover:text-white border border-blue-500">
      Sign Out
    </Button>
  );
};
