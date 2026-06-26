import React from "react";
import { Sparkles, Briefcase, GraduationCap, CheckCircle, ArrowRight, ShieldCheck, Heart } from "lucide-react";

interface LandingPageProps {
  navigate: (path: string) => void;
}

export function LandingPage({ navigate }: LandingPageProps) {
  return (
    <div className="relative isolate overflow-hidden bg-slate-50 student-glow min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      
      {/* Decorative top background gradient */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] width-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-indigo-300 to-purple-400 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72rem] aspect-[1155/678]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-grow flex flex-col justify-center">
        
        {/* Core Hero Branding Section */}
        <div className="mx-auto max-w-3xl text-center space-y-4 mb-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3.5 py-1 text-sm font-medium text-indigo-700 ring-1 ring-inset ring-indigo-600/10">
            <Sparkles className="h-4 w-4 text-indigo-500 animate-bounce" />
            <span>Introducing CareerHub AI 2.0</span>
          </div>
          
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl max-w-4xl mx-auto leading-none">
            Where Ambition Meets <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-emerald-600">Enterprise Capability</span>
          </h1>
          
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A fully integrated career intelligence platform offering separate, professional workflows tailored for ambitious students and data-driven recruiter portfolios.
          </p>
        </div>

        {/* Distinct Unified CTAs & Split Portals */}
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
          
          {/* Student Portal Split Card */}
          <div className="flex flex-col justify-between rounded-3xl border border-indigo-100 bg-white p-8 shadow-xl shadow-indigo-100/40 hover:shadow-indigo-150/60 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform" />
            
            <div className="relative z-10 space-y-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <GraduationCap className="h-6 w-6" />
              </div>

              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-1 rounded">Career Accelerator</span>
                <h2 className="font-display text-2xl font-extrabold text-slate-900 mt-2">
                  Student Portal
                </h2>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                  ATS score audits, skill deficit maps, and live real-time Gemini behavior evaluations to fast-track your path to elite job interviews.
                </p>
              </div>

              <div className="border-t border-slate-100/80 pt-4 space-y-2.5">
                <div className="flex items-center gap-2.5 text-xs text-slate-600">
                  <CheckCircle className="h-4 w-4 text-indigo-500" />
                  <span>Interactive Real-time ATS Resume Parser</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-600">
                  <CheckCircle className="h-4 w-4 text-indigo-500" />
                  <span>Real-time AI Interview Coach Simulator</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-600">
                  <CheckCircle className="h-4 w-4 text-indigo-500" />
                  <span>Algorithmic Job Match Percentage matrix</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-600">
                  <CheckCircle className="h-4 w-4 text-indigo-500" />
                  <span>Skill-Gap Analysis and target recommendations</span>
                </div>
              </div>
            </div>

            <div className="mt-8 relative z-10">
              <button
                type="button"
                id="cta-student-portal"
                onClick={() => navigate("/student/login")}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 focus:outline-none transition-all group-hover:gap-3"
              >
                <span>Enter Student Portal</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <p className="text-center text-xxs text-slate-400 mt-2.5">
                Join 14,000+ top students finding dream careers.
              </p>
            </div>
          </div>

          {/* Recruiter Portal Split Card */}
          <div className="flex flex-col justify-between rounded-3xl border border-emerald-100 bg-white p-8 shadow-xl shadow-emerald-50/30 hover:shadow-emerald-100/50 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform" />
            
            <div className="relative z-10 space-y-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Briefcase className="h-6 w-6" />
              </div>

              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-1 rounded">Enterprise Engine</span>
                <h2 className="font-display text-2xl font-extrabold text-slate-900 mt-2">
                  Recruiter Portal
                </h2>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                  Candidate screening metrics, dynamic pipeline matrices, and Gemini-based resume index ranking. Work with total compliance.
                </p>
              </div>

              <div className="border-t border-slate-100/80 pt-4 space-y-2.5">
                <div className="flex items-center gap-2.5 text-xs text-slate-600">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>Gemini Semantic Candidate Ranking matrix</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-600">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>Interactive applicant screening records</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-600">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>Recruitment analytics dashboards</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-600">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>Adaptive hiring pipeline organizer</span>
                </div>
              </div>
            </div>

            <div className="mt-8 relative z-10">
              <button
                type="button"
                id="cta-recruiter-portal"
                onClick={() => navigate("/recruiter/login")}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-300 hover:bg-slate-900 focus:outline-none transition-all group-hover:gap-3"
              >
                <span>Enter Recruiter Portal</span>
                <ArrowRight className="h-4 w-4 text-emerald-400" />
              </button>
              <p className="text-center text-xxs text-slate-400 mt-2.5">
                Trusted by high-performance hiring managers.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Modern, architectural structural footer */}
      <footer className="w-full bg-white border-t border-slate-100 mt-12 py-5 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">CareerHub AI</span>
            <span className="text-slate-300">|</span>
            <span>Next-Generation Career Matchmaking Tech</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Strict Role-Based Security Verified (ROLE_STUDENT, ROLE_RECRUITER, ROLE_ADMIN)</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
