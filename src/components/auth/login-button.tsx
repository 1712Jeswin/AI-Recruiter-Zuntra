"use client";

import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export const Loginbuttons = () => {
  const signInWithGithub = async () =>
    await authClient.signIn.social({
      callbackURL: "/dashboard",
      provider: "github",
    });

  const signInWithGoogle = async () =>
    await authClient.signIn.social({
      callbackURL: "/dashboard",
      provider: "google",
    });

  return (
    <div className="flex items-center justify-between w-full gap-3 mt-2">
      <Button
        onClick={signInWithGithub}
        variant="outline"
        className="flex items-center justify-center gap-2 w-1/2 border-gray-300 hover:bg-gray-100 transition-all duration-200"
      >
        <FaGithub size={18} />
        GitHub
      </Button>

      <Button
        onClick={signInWithGoogle}
        variant="outline"
        className="flex items-center justify-center gap-2 w-1/2 border-gray-300 hover:bg-gray-100 transition-all duration-200"
      >
        <FcGoogle size={18} />
        Google
      </Button>
    </div>
  );
};
