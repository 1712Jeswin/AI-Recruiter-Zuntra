import { getSession } from "@/lib/auth";
import { SignOutButton } from "@/components/auth/signout-button";

const WelcomeContainer = async () => {
  const session = await getSession();
  const user = session.user;
  const firstLetter = user?.name?.[0].toUpperCase() || "U";

  return (
    <div
      className="
        flex items-center justify-between
        w-full md:w-[95%] 
        bg-gradient-to-r from-blue-50 to-slate-100
        p-6 rounded-xl shadow-md border border-slate-200
        transition-all duration-300
        mx-auto md:mr-3
      "
    >
      {/* Left Section - Welcome Text */}
      <div className="ml-0 md:ml-6 transition-all duration-300">
        <h2 className="text-2xl font-semibold text-gray-800">
          Welcome Back,{" "}
          <span className="text-blue-600">{user?.name || "User"}</span>
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          AI-Driven Interviews — Hassle-Free Hiring
        </p>
      </div>

      {/* Right Section - Profile + Sign Out */}
      <div className="flex flex-col items-center space-y-2">
        <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xl font-bold shadow">
          {firstLetter}
        </div>
        <SignOutButton />
      </div>
    </div>
  );
};

export default WelcomeContainer;
