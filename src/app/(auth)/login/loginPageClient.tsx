"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loginbuttons } from "@/components/auth/login-button";
import Image from "next/image";

const LoginPageClient = () => {
  const [isSignUp, setIsSignUp] = useState(false); // Default to Sign In

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4">
      {/* Title outside the card */}
      {/* <h1 className="absolute top-10 text-4xl font-extrabold bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 bg-clip-text text-transparent tracking-tight text-center">
        HireMind AI
      </h1> */}

      {/* Card (no rounded corners) */}
      <Card className="w-full max-w-sm shadow-xl border border-gray-100 bg-white/70 backdrop-blur-md transition-all duration-300 hover:shadow-2xl overflow-hidden mt-24 p-0 rounded-none">
        {/* Full-width Image (no gap at top) */}
        <div className="relative w-full h-48 overflow-hidden">
          <Image
            src="/login.png"
            alt="Login Banner"
            fill
            className="object-cover w-full h-full"
            priority
          />
        </div>

        {/* Header */}
        <CardHeader className="text-center space-y-1 mt-4">
          <CardTitle className="text-2xl font-bold text-gray-800">
            {isSignUp ? "Create an account" : "Welcome back"}
          </CardTitle>
          <CardDescription className="text-gray-600 text-sm">
            {isSignUp
              ? "Sign up quickly to get started Hiring Candidates"
              : "Sign in quickly to get started Hiring Candidates"}
          </CardDescription>
        </CardHeader>

        {/* Login Buttons */}
        <CardContent className="flex justify-center">
          {/* @ts-ignore */}
          <Loginbuttons />
        </CardContent>

        {/* Toggle Text */}
        <div className="text-center mt-4 mb-6 text-sm text-gray-600">
          {isSignUp ? (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setIsSignUp(false)}
                className="text-blue-600 hover:text-blue-700 font-medium underline"
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              Don’t have an account?{" "}
              <button
                onClick={() => setIsSignUp(true)}
                className="text-blue-600 hover:text-blue-700 font-medium underline"
              >
                Sign up
              </button>
            </>
          )}
        </div>

        {/* Terms */}
        {isSignUp && (
          <p className="text-xs text-gray-600 mb-4 text-center px-4">
            By signing up, you agree to our{" "}
            <a
              href="/terms"
              className="underline text-blue-600 hover:text-blue-700"
            >
              Terms
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              className="underline text-blue-600 hover:text-blue-700"
            >
              Privacy Policy
            </a>
            .
          </p>
        )}
      </Card>
    </div>
  );
};

export default LoginPageClient;
