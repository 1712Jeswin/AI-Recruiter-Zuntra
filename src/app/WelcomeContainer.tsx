import { getSession } from "@/lib/auth";
import { SignOutButton } from "@/components/auth/signout-button";
import { LayoutDashboard } from "lucide-react";

const WelcomeContainer = async () => {
  const session = await getSession();
  const user = session?.user;
  const firstLetter = user?.name?.[0]?.toUpperCase() || "U";
  const firstName = user?.name?.split(" ")[0] || "User";

  return (
    <div className="
      relative w-full md:w-[95%] mx-auto md:mr-3 
      rounded-3xl 
      bg-[#F9FBFF] 
      border border-white/70
      shadow-[0_4px_20px_rgba(0,0,0,0.03)]
      overflow-hidden 
      p-8 
      backdrop-blur-[2px]
    ">
      
      {/* subtle 3D ambient blobs */}
      <div className="absolute -top-16 -left-16 w-52 h-52 bg-blue-50 rounded-full opacity-60 blur-3xl"></div>
      <div className="absolute -bottom-16 -right-16 w-52 h-52 bg-indigo-50 rounded-full opacity-60 blur-3xl"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">

        {/* LEFT SECTION */}
        <div className="space-y-4 flex-1">

          {/* Badge */}
          <div
            className="
              inline-flex items-center gap-2 
              px-3 py-1.5
              rounded-full
              bg-white/70
              border border-white/60 
              shadow-[0_2px_6px_rgba(0,0,0,0.04)]
              text-blue-600 
              text-xs font-semibold
              backdrop-blur-sm
            "
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            RECRUITER DASHBOARD
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Welcome back,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              {firstName}!
            </span>
          </h1>

          <p className="text-slate-500 max-w-md leading-relaxed text-[15px]">
            Seamlessly manage your AI-driven interviews and track candidate progress with intuitive tools.
          </p>
        </div>

        {/* RIGHT FLOATING CARD */}
        <div
          className="
            flex items-center gap-4
            bg-white/80 
            border border-white/60
            backdrop-blur-md
            p-4 pr-6 pl-5 
            rounded-2xl
            shadow-[0_6px_16px_rgba(0,0,0,0.06)]
            transition-all
          "
        >
          {/* Avatar */}
          <div className="relative">
            <div
              className="
                w-12 h-12 flex items-center justify-center 
                rounded-xl 
                bg-gradient-to-br from-blue-600 to-indigo-600 
                text-white font-bold text-lg
                shadow-[0_4px_10px_rgba(0,0,0,0.12)]
              "
            >
              {firstLetter}
            </div>

            {/* Status Dot */}
            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
            </span>
          </div>

          {/* User Info */}
          <div className="hidden sm:flex flex-col justify-center">
            <span className="text-sm font-semibold text-slate-800 truncate max-w-[150px]">
              {user?.name}
            </span>
            <span className="text-xs text-slate-500 truncate max-w-[150px]">
              {user?.email}
            </span>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-8 bg-slate-200"></div>

          {/* Sign Out */}
          <SignOutButton />
        </div>

      </div>
    </div>
  );
};

export default WelcomeContainer;
