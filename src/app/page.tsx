import React from "react";
// Import authentication utilities from the reference code structure
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link"; // Use Link for client-side routing

import {
  BrainCircuit,
  ArrowRight,
  LayoutDashboard,
  Users,
  MessageSquare,
  FileText,
  Mic,
  Wand2,
  BarChart3,
  UploadCloud,
  ScanSearch,
  CheckCircle2,
  Star
} from "lucide-react";

// 1. Convert to an 'async' function to make it a Next.js Server Component
const LandingPage = async () => {
  // 2. Implement the session check and redirection logic
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  // Standard HTML anchor tags are now replaced with Next.js <Link> components
  // for all 'Get Started' and 'Log in' buttons.

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-100">
      {/* Navigation */}
      <nav className="fixed w-full z-50 top-0 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">
                HireMindAI
              </span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a
                href="#features"
                className="text-slate-600 hover:text-blue-600 font-medium transition"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-slate-600 hover:text-blue-600 font-medium transition"
              >
                How it Works
              </a>
              
            </div>
            <div className="flex space-x-4 items-center">
              {/* Login Button - Changed <a> to <Link> */}
              <Link href="/login">
                <button className="hidden md:flex text-slate-600 hover:text-blue-600 font-medium px-4 py-2 transition hover:bg-slate-100 rounded-md">
                  Log in
                </button>
              </Link>
              {/* Get Started Button - Changed <a> to <Link> */}
              <Link href="/login">
                <button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 px-5 py-2 rounded-lg font-medium transition">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Hero Content */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-semibold mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                New: AI Voice Agent 2.0
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1] mb-6">
                AI Recruiter That <br />
                <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  Interviews For You
                </span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
                Automate resume screening, AI voice interviews, and candidate
                evaluation — all in one modern platform. Hire the top 1% faster.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Get Started Free Button - Changed <a> to <Link> */}
                <Link href="/login">
                  <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-semibold text-lg transition shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2">
                    Get Started Free <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-4 text-sm text-slate-500">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white"></div>
                  <div className="w-8 h-8 rounded-full bg-slate-300 border-2 border-white"></div>
                  <div className="w-8 h-8 rounded-full bg-slate-400 border-2 border-white"></div>
                </div>
                <p>Trusted by 500+ HR teams</p>
              </div>
            </div>

            {/* Hero Visual (CSS Mockup) */}
            <div className="relative lg:absolute lg:right-0 lg:w-[50%] xl:w-[45%]">
              {/* Decorative blob */}
              <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50 animate-pulse"></div>

              {/* Dashboard Mockup */}
              <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform rotate-1 hover:rotate-0 transition duration-500">
                {/* Mock Header */}
                <div className="h-14 border-b border-slate-100 flex items-center justify-between px-6 bg-white">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="h-8 w-32 bg-slate-100 rounded-md"></div>
                </div>

                {/* Mock Content */}
                <div className="p-6 flex gap-6">
                  {/* Sidebar */}
                  <div className="w-16 hidden sm:flex flex-col gap-4 items-center pt-2 border-r border-slate-100 pr-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <LayoutDashboard className="w-5 h-5" />
                    </div>
                    <div className="w-10 h-10 rounded-lg hover:bg-slate-50 text-slate-400 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="w-10 h-10 rounded-lg hover:bg-slate-50 text-slate-400 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Main Area */}
                  <div className="flex-1">
                    <div className="flex justify-between items-end mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">
                          Product Designer Role
                        </h3>
                        <p className="text-sm text-slate-500">
                          Active • 142 Candidates
                        </p>
                      </div>
                      <div className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        92% Match Found
                      </div>
                    </div>

                    {/* Candidate List */}
                    <div className="space-y-3">
                      {/* Item 1 */}
                      <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 flex items-center justify-between group hover:bg-blue-50 transition cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs">
                            SJ
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">
                              Sarah Jenkins
                            </p>
                            <p className="text-xs text-slate-500">
                              Senior UX Designer
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-blue-600 font-bold text-sm">
                            9.4/10
                          </div>
                          <div className="text-xs text-slate-400">AI Score</div>
                        </div>
                      </div>

                      {/* Item 2 */}
                      <div className="p-4 rounded-xl border border-slate-100 bg-white flex items-center justify-between hover:border-blue-200 transition cursor-pointer opacity-80">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                            MK
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">
                              Michael Klein
                            </p>
                            <p className="text-xs text-slate-500">
                              Product Designer
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-slate-600 font-bold text-sm">
                            8.8/10
                          </div>
                          <div className="text-xs text-slate-400">AI Score</div>
                        </div>
                      </div>

                      {/* Audio Waveform Visual */}
                      <div className="mt-4 bg-slate-50 rounded-lg p-3 border border-slate-100">
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>AI Voice Interview Recording</span>
                          <span>04:12</span>
                        </div>
                        <div className="flex items-center gap-1 h-8">
                          <div className="w-1 h-3 bg-blue-300 rounded-full"></div>
                          <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                          <div className="w-1 h-8 bg-blue-600 rounded-full"></div>
                          <div className="w-1 h-4 bg-blue-400 rounded-full"></div>
                          <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                          <div className="w-1 h-3 bg-blue-300 rounded-full"></div>
                          <div className="w-1 h-2 bg-slate-200 rounded-full"></div>
                          <div className="w-1 h-4 bg-slate-300 rounded-full"></div>
                          <div className="w-1 h-2 bg-slate-200 rounded-full"></div>
                          <div className="w-1 h-5 bg-blue-500 rounded-full ml-auto"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos / Social Proof */}
      <div className="border-y border-slate-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-slate-400 mb-6 uppercase tracking-widest">
            Powering Hiring At
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale">
            <span className="text-xl font-bold text-slate-800">Acme Corp</span>
            <span className="text-xl font-bold text-slate-800">GlobalTech</span>
            <span className="text-xl font-bold text-slate-800">Nebula</span>
            <span className="text-xl font-bold text-slate-800">FoxRun</span>
            <span className="text-xl font-bold text-slate-800">Circle</span>
          </div>
        </div>
      </div>

      {/* Core Features */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-blue-600 font-semibold tracking-wide uppercase text-sm mb-2">
              Features
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything you need to hire seamlessly
            </h3>
            <p className="text-slate-600 text-lg">
              Streamline your recruitment pipeline with our suite of AI-powered
              tools designed to remove bias and save time.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-50 rounded-2xl p-8 transition duration-300 hover:shadow-xl hover:-translate-y-1 border border-slate-100 group">
              <div className="w-14 h-14 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition">
                <FileText className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">
                AI Resume Screening
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Automatically parse, score, and shortlist resumes based on job
                descriptions with 99% accuracy.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50 rounded-2xl p-8 transition duration-300 hover:shadow-xl hover:-translate-y-1 border border-slate-100 group">
              <div className="w-14 h-14 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition">
                <Mic className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">
                AI Voice Interviewer
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Our conversational voice agent conducts technical and behavioral
                interviews 24/7.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 rounded-2xl p-8 transition duration-300 hover:shadow-xl hover:-translate-y-1 border border-slate-100 group">
              <div className="w-14 h-14 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition">
                <Wand2 className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">
                Smart Flows
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Build role-specific interview workflows with drag-and-drop
                simplicity. No coding required.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-50 rounded-2xl p-8 transition duration-300 hover:shadow-xl hover:-translate-y-1 border border-slate-100 group">
              <div className="w-14 h-14 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition">
                <BarChart3 className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">
                Candidate Analytics
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Deep insights into candidate performance, soft skills, and
                technical capabilities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="py-24 bg-slate-50 relative overflow-hidden"
      >
        <div
          className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(#cbd5e1 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        ></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-slate-900">
              How HireMindAI works
            </h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 items-start relative">
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-slate-200 via-blue-200 to-slate-200 z-0"></div>

            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-white rounded-full shadow-lg border-4 border-slate-50 flex items-center justify-center mb-6 text-blue-600">
                <UploadCloud className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">
                1. Upload Role
              </h4>
              <p className="text-slate-600 text-sm px-4">
                Define the job requirements and upload the JD. Our AI parses the
                details instantly.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-white rounded-full shadow-lg border-4 border-slate-50 flex items-center justify-center mb-6 text-blue-600">
                <ScanSearch className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">
                2. AI Screening
              </h4>
              <p className="text-slate-600 text-sm px-4">
                The system scores incoming resumes and automatically invites top
                matches.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-white rounded-full shadow-lg border-4 border-slate-50 flex items-center justify-center mb-6 text-blue-600">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">
                3. Interview & Report
              </h4>
              <p className="text-slate-600 text-sm px-4">
                AI conducts the voice interview and generates a detailed
                scorecard for you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats / Why Choose */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-2xl p-8 text-center border border-blue-100">
              <div className="text-4xl font-bold text-blue-600 mb-2">80%</div>
              <div className="text-slate-700 font-medium">
                Reduction in hiring time
              </div>
              <p className="text-slate-500 text-sm mt-2">
                Fill positions in days, not months.
              </p>
            </div>
            <div className="bg-blue-50 rounded-2xl p-8 text-center border border-blue-100">
              <div className="text-4xl font-bold text-blue-600 mb-2">100%</div>
              <div className="text-slate-700 font-medium">
                Unbiased Evaluation
              </div>
              <p className="text-slate-500 text-sm mt-2">
                Purely merit-based scoring.
              </p>
            </div>
            <div className="bg-blue-50 rounded-2xl p-8 text-center border border-blue-100">
              <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-slate-700 font-medium">
                Automated Interviewing
              </div>
              <p className="text-slate-500 text-sm mt-2">
                Candidates interview when they want.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-slate-900">
              Loved by hiring managers
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Review 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-slate-600 mb-6">
                "HireMindAI completely changed how we hire engineers. The AI
                asks surprisingly deep technical questions."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                  EL
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    Elena Rodriguez
                  </div>
                  <div className="text-xs text-slate-500">CTO at TechFlow</div>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-slate-600 mb-6">
                "The dashboard is incredibly clean and the candidate summaries
                save me hours of reading resumes."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                  DJ
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    David Jones
                  </div>
                  <div className="text-xs text-slate-500">
                    Head of HR, ScaleUp
                  </div>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-slate-600 mb-6">
                "Set it up in 5 minutes. The voice agent sounds professional and
                candidates actually enjoyed the process."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                  SK
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    Sarah Kim
                  </div>
                  <div className="text-xs text-slate-500">
                    Recruiter, LogisticsInc
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
  

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-600 rounded-3xl p-12 text-center text-white relative overflow-hidden shadow-2xl">
            {/* Decorative circles */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full translate-x-1/2 translate-y-1/2"></div>

            <h2 className="text-3xl md:text-4xl font-bold mb-6 relative z-10">
              Ready to automate your hiring?
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto relative z-10">
              Join 500+ companies using HireMindAI to interview candidates
              faster and fairer.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
              {/* Get Started Free Button - Changed <a> to <Link> */}
              <Link href="/login">
                <button className="bg-white text-blue-600 font-bold text-lg hover:bg-blue-50 h-auto py-3.5 px-8 rounded-xl transition">
                  Get Started Free
                </button>
              </Link>
              <button className="bg-blue-700 border border-blue-500 text-white font-bold text-lg hover:bg-blue-800 h-auto py-3.5 px-8 rounded-xl transition">
                Book a Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center text-white">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-slate-900">
                HireMindAI
              </span>
            </div>
            <div className="flex gap-8 text-sm text-slate-600">
              <a href="#" className="hover:text-blue-600 transition">
                About
              </a>
              <a href="#" className="hover:text-blue-600 transition">
                Contact
              </a>
              <a href="#" className="hover:text-blue-600 transition">
                Terms
              </a>
              <a href="#" className="hover:text-blue-600 transition">
                Privacy
              </a>
            </div>
          </div>
          <div className="text-center md:text-left text-sm text-slate-400">
            &copy; 2024 HireMindAI Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
export default LandingPage;