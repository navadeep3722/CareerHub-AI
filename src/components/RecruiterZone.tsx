import React, { useState, useEffect } from "react";
import { UserSession, Candidate, JobPosting, RecruitmentAnalytics } from "../types";
import { 
  Sparkles, Briefcase, Eye, Send, CheckCircle2, ChevronRight, AlertTriangle, Play,
  Mail, Lock, Building, TrendingUp, Users, ArrowUpRight, BarChart3, Clock, CheckCircle,
  XCircle, Filter, PlusCircle, ArrowRight, Loader2, DollarSign, BrainCircuit, RefreshCw, ClipboardCopy
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface RecruiterZoneProps {
  currentPath: string;
  navigate: (path: string) => void;
  user: UserSession | null;
  loginUser: (session: UserSession) => void;
}

// Initial Mock Datasets
const MOCK_APPLICANTS: Candidate[] = [
  {
    id: "cand-1",
    name: "Alexander Sterling",
    email: "alex.sterling@example.com",
    experienceYears: 4,
    skills: ["React", "TypeScript", "Python", "LLMs", "Vector Databases", "GCP"],
    education: "B.S. in Computer Science - Stanford University",
    currentRole: "AI Developer at CloudScale",
    resumeText: "SUMMARY: Energetic machine learning developer specializing in production deployment of LLM applications. Working as an AI Developer at CloudScale for 4 years. TECHNICAL SKILLS: Python, TypeScript, React, PostgreSQL, LangChain, vector storage, GCP, Docker. PROJECTS: Built a smart customer support representative utilizing serverless functions and Retrieval-Augmented Generation.",
    status: "Applied"
  },
  {
    id: "cand-2",
    name: "Sophia Vance",
    email: "sophia.v@example.com",
    experienceYears: 5,
    skills: ["Product Roadmap", "Agile", "PRDs", "Excel", "User Research", "SaaS"],
    education: "MBA - Wharton School",
    currentRole: "Associate Product Manager",
    resumeText: "SUMMARY: Strategic and user-focused product manager with 5 years of tenure in high-growth B2B enterprise software companies. Experience setting full product roadmap and driving development lifecycles. TECHNICAL SKILLS: Jira, Figma, Product Analytics, Excel, Scrum, Agile methodology. EDUCATION: MBA at Wharton School.",
    status: "Applied"
  },
  {
    id: "cand-3",
    name: "Marcus Thorne",
    email: "marcus.t@threedev.io",
    experienceYears: 1,
    skills: ["HTML", "CSS", "Vanilla JS", "Basic SQL", "Communication"],
    education: "Self-trained Bootcamper",
    currentRole: "Junior Web Assistant",
    resumeText: "SUMMARY: Enthusiastic front-end design student and bootcamper looking for junior developer roles. Skilled in HTML, CSS, Javascript. Familiar with writing simple landing pages and WordPress layouts. Excited to learn more about LLMs and backend cloud infrastructures.",
    status: "Applied"
  }
];

const MOCK_JOBS: JobPosting[] = [
  {
    id: "job-1",
    title: "Senior AI Engineer",
    department: "Engineering",
    location: "San Francisco, CA (Hybrid)",
    type: "Full-time",
    salary: "$160,000 - $210,000",
    requirements: [
      "3+ years experience building features with large language models",
      "Proficient in TypeScript, Node.js, and Python",
      "Experience with retrieval-augmented generation (RAG) pipelines",
      "Familiar with cloud deployments (GCP/AWS)"
    ],
    description: "Join the core AI Innovations team to architect CareerHub's future matchmaking models, utilizing LLMs, smart vector stores, and custom agents.",
    status: "Active",
    applicantsCount: 3,
    createdAt: "2026-06-15"
  },
  {
    id: "job-2",
    title: "SaaS Product Coordinator",
    department: "Product Management",
    location: "Remote",
    type: "Full-time",
    salary: "$90,000 - $125,000",
    requirements: [
      "Bachelor's degree or equivalent experience",
      "Excellent customer-facing communication skills",
      "Prior experience writing PRDs or product requirements",
      "Experience with Agile/Scrum processes"
    ],
    description: "Looking for an operational-minded coordinator to work directly with engineering leads and customer stakeholders, refining our client experience portals.",
    status: "Active",
    applicantsCount: 2,
    createdAt: "2026-06-17"
  }
];

export function RecruiterZone({ currentPath, navigate, user, loginUser }: RecruiterZoneProps) {
  // Navigation Router states
  const isLogin = currentPath === "/recruiter/login";
  const isRegister = currentPath === "/recruiter/register";
  const isDashboard = currentPath === "/recruiter/dashboard";

  // Login Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [loading, setLoading] = useState(false);

  // Registration states
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regCompany, setRegCompany] = useState("");
  const [regIndustry, setRegIndustry] = useState("Enterprise Software");

  // Dashboard Tab Management: 'candidates' | 'pipeline' | 'jobs' | 'analytics'
  const [activeTab, setActiveTab] = useState<'candidates' | 'pipeline' | 'jobs' | 'analytics'>('candidates');

  // --- RECRUITER STATE DATA ENGINE (SIMULATED MUTATIVE STORAGE) ---
  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    const saved = localStorage.getItem("recruiter_candidates");
    return saved ? JSON.parse(saved) : MOCK_APPLICANTS;
  });

  const [jobPostings, setJobPostings] = useState<JobPosting[]>(() => {
    const saved = localStorage.getItem("recruiter_jobs");
    return saved ? JSON.parse(saved) : MOCK_JOBS;
  });

  useEffect(() => {
    localStorage.setItem("recruiter_candidates", JSON.stringify(candidates));
  }, [candidates]);

  useEffect(() => {
    localStorage.setItem("recruiter_jobs", JSON.stringify(jobPostings));
  }, [jobPostings]);

  // --- FEATURE - CANDIDATE MATCH SCORING ENGINE ---
  const [selectedJobDesc, setSelectedJobDesc] = useState(`We are seeking candidates to evaluate. Match skills against the following Senior AI Engineer guidelines:\n- 3+ years experience building features with large language models\n- Proficient in TypeScript, Node.js, and Python\n- Experience with retrieval-augmented generation (RAG) pipelines\n- Familiar with cloud deployments`);
  const [rankingLoading, setRankingLoading] = useState(false);
  const [rankingError, setRankingError] = useState("");
  const [apiKeyMissingError, setApiKeyMissingError] = useState(false);

  // Run Candidates Ranking through Gemini
  const runCandidateRanking = async () => {
    if (!selectedJobDesc.trim()) {
      setRankingError("Please specify a target Job Description checklist to compare candidates.");
      return;
    }

    setRankingLoading(true);
    setRankingError("");

    try {
      const response = await fetch("/api/recruiter/rank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: selectedJobDesc,
          candidates: candidates
        })
      });

      if (!response.ok) {
        const errObj = await response.json();
        throw new Error(errObj.details || errObj.error || "Hiring evaluation lookup failed");
      }

      const parsedResults = await response.json();
      
      // Merge results with existing candidates
      const updatedCandidates = candidates.map(c => {
        const rankInfo = parsedResults.find((r: any) => String(r.id) === String(c.id));
        if (rankInfo) {
          return {
            ...c,
            suitabilityScore: rankInfo.suitabilityScore,
            criticalGaps: rankInfo.criticalGaps,
            strengthsSummary: rankInfo.strengthsSummary,
            suggestedQuestions: rankInfo.suggestedQuestions,
            status: (rankInfo.suitabilityScore ?? 50) >= 75 ? "Screened" as const : "Applied" as const
          };
        }
        return c;
      });

      setCandidates(updatedCandidates);
    } catch (err: any) {
      console.error(err);
      setRankingError(err.message || "An error occurred with Candidate Ranking.");
      if (err.message?.includes("GEMINI_API_KEY")) {
        setApiKeyMissingError(true);
      }
    } finally {
      setRankingLoading(false);
    }
  };

  // --- FEATURE - NEW JOB DESCRIPTION GENERATION ---
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newJobDept, setNewJobDept] = useState("Engineering");
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState("");

  const handleGenerateJobListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle.trim()) {
      setGenError("Please set a job title.");
      return;
    }

    setGenLoading(true);
    setGenError("");

    try {
      const response = await fetch("/api/recruiter/generate-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newJobTitle,
          department: newJobDept
        })
      });

      if (!response.ok) {
        const errObj = await response.json();
        throw new Error(errObj.details || errObj.error || "Could not generate job listing");
      }

      const generated = await response.json();

      const newPost: JobPosting = {
        id: `job-${Date.now()}`,
        title: newJobTitle,
        department: newJobDept,
        location: newJobDept.toLowerCase() === "engineering" ? "San Francisco (Hybrid)" : "Remote",
        type: "Full-time",
        salary: generated.salary || "$110,000 - $145,000",
        requirements: generated.requirements || [
          "Prior industry experience",
          "Excellent collaboration metrics",
          "Advanced technical communication skills"
        ],
        description: generated.description || "Exciting role to lead core software deployment teams.",
        status: "Active",
        applicantsCount: 0,
        createdAt: new Date().toISOString().split("T")[0]
      };

      setJobPostings(prev => [newPost, ...prev]);
      setNewJobTitle("");
      alert("Success! High-performance Job description compiled via Gemini and appended to current active listings!");
    } catch (err: any) {
      console.error(err);
      setGenError(err.message || "AI generator pipeline failed.");
      if (err.message?.includes("GEMINI_API_KEY")) {
        setApiKeyMissingError(true);
      }
    } finally {
      setGenLoading(false);
    }
  };

  // Move Pipeline Candidate status
  const updateCandidateStatus = (candId: string, newStatus: Candidate['status']) => {
    setCandidates(prev => prev.map(c => c.id === candId ? { ...c, status: newStatus } : c));
  };

  // --- SUBMIT REC LOGIN ---
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorText("Company email and password criteria must be met.");
      return;
    }
    setLoading(true);
    setErrorText("");

    setTimeout(() => {
      const match = email.includes("@") && password.length >= 4;
      if (match) {
        loginUser({
          email: email,
          name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
          role: "ROLE_RECRUITER",
          companyName: email.includes("google") ? "Google Inc." : "CareerScale LLC",
          token: "MOCK_RECRUITER_PASS_555"
        });
        navigate("/recruiter/dashboard");
      } else {
        setErrorText("Enterprise verification fails. Password or email block incorrect.");
      }
      setLoading(false);
    }, 800);
  };

  // --- SUBMIT REC REGS ---
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword || !regCompany) {
      setErrorText("All core details are required for recruiter portal setup.");
      return;
    }
    setLoading(true);

    setTimeout(() => {
      loginUser({
        email: regEmail,
        name: regName,
        role: "ROLE_RECRUITER",
        companyName: regCompany,
        token: "MOCK_REC_OAUTH_ACTIVE_4"
      });
      navigate("/recruiter/dashboard");
      setLoading(false);
    }, 800);
  };

  const handleGoogleMock = () => {
    loginUser({
      email: "recruiter@careerhub.ai",
      name: "Olivia Vance",
      role: "ROLE_RECRUITER",
      companyName: "CareerHub Corporate Services",
      token: "GOOGLE_OAUTH_RECRUITER"
    });
    navigate("/recruiter/dashboard");
  };

  // Analytics Math
  const totalApps = candidates.length;
  const screenedCount = candidates.filter(c => c.status !== "Applied" && c.status !== "Rejected").length;
  const interviewingCount = candidates.filter(c => c.status === "Interviewing").length;
  const offeredCount = candidates.filter(c => c.status === "Offered").length;
  const averageSuitScore = Math.round(
    candidates.reduce((acc, curr) => acc + (curr.suitabilityScore || 0), 0) / 
    candidates.filter(c => c.suitabilityScore !== undefined).length
  ) || 0;

  // --- RENDER REC LOGIN ---
  if (isLogin) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8 recruiter-glow">
        <div className="w-full max-w-md space-y-8 rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
          
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
              <Briefcase className="h-6 w-6" />
            </div>
            <h2 className="font-display text-3xl font-extrabold text-white leading-tight">
              Hire Smarter with AI
            </h2>
            <p className="text-sm text-slate-400">
              Corporate portal for ATS candidate rank, pipeline matching, and automation.
            </p>
          </div>

          {errorText && (
            <div className="rounded-lg bg-red-950/30 p-3.5 text-xs text-red-400 border border-red-900/50 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{errorText}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLoginSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Company Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="recruitment@company.com"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-3 pl-10 pr-4 text-sm font-medium text-white outline-none transition focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Company Password
                </label>
                <button
                  type="button"
                  onClick={() => alert("Please consult company IT support or recruit a fresh mock testing account.")}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-3 pl-10 pr-4 text-sm font-medium text-white outline-none transition focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-450 cursor-pointer select-none text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-650 text-emerald-500 focus:ring-emerald-500 h-4 w-4 accent-emerald-500"
                />
                <span>Remember Me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-950/20 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Activating enterprise cluster...</span>
                </>
              ) : (
                <span>Login as Recruiter</span>
              )}
            </button>
          </form>

          <div className="relative flex items-center justify-center my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <span className="relative bg-slate-900 px-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">
              Secured OAuth
            </span>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleMock}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-755 bg-slate-800 py-3 text-sm font-semibold text-slate-350 hover:bg-slate-750 text-white transition cursor-pointer"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5.04c1.64 0 3.12.56 4.29 1.67l3.21-3.21C17.55 1.7 14.99 1 12 1 7.35 1 3.39 3.65 1.5 7.5l3.9 3.03C6.33 7.55 8.95 5.04 12 5.04z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.25c0-.82-.07-1.61-.21-2.38H12v4.51h6.46c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.38-4.88 3.38-8.52z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.4 14.47C5.16 13.79 5 13.06 5 12.3s.16-1.49.4-2.17L1.5 7.1C.54 9.01 0 11.16 0 12.3s.54 3.29 1.5 5.2l3.9-3.03z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.1.74-2.51 1.18-4.3 1.18-3.05 0-5.67-2.51-6.6-5.55l-3.9 3.03C3.39 20.35 7.35 23 12 23z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={() => navigate("/recruiter/register")}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-700 bg-transparent py-3 text-sm font-bold text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
            >
              <span>Register Enterprise Recruiter Portfolio</span>
              <ArrowRight className="h-4 w-4 text-emerald-400" />
            </button>
          </div>

        </div>
      </div>
    );
  }

  // --- RENDER REC REGS ---
  if (isRegister) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-950 px-4 py-8 sm:px-6 lg:px-8 recruiter-glow">
        <div className="w-full max-w-xl space-y-6 rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl text-left">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">Recruiter License Plan</span>
            <h2 className="font-display text-2xl font-extrabold text-white mt-1">
              Configure Corporate Hiring Portal
            </h2>
            <p className="text-sm text-slate-400">
              Map candidate rankings directly to enterprise requirements with smart indexes.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleRegisterSubmit}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Lead Recruiter Name</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Olivia Vance"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 p-3 text-sm text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Registered Company Name</label>
                <input
                  type="text"
                  required
                  value={regCompany}
                  onChange={(e) => setRegCompany(e.target.value)}
                  placeholder="Anthropo Matchmaker Corp"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 p-3 text-sm text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Company Email</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="olivia.vance@company.com"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 p-3 text-sm text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Enterprise Password</label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/80 p-3 text-sm text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Primary Market Industry Segment</label>
              <select
                value={regIndustry}
                onChange={(e) => setRegIndustry(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-sm text-white outline-none cursor-pointer"
              >
                <option value="Enterprise Software">Enterprise Software & SaaS Group</option>
                <option value="Financial Engineering">Financial Tech & Quantitative Research</option>
                <option value="BioTech">AI Health & Precision BioTech</option>
                <option value="Automotive">Autonomous Robotics & Electric Grid</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-sm font-bold text-white shadow-lg transition"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Deploying corporate parameters...</span>
                </>
              ) : (
                <span>Register Hiring License</span>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-4">
            Authorized with CareerHub?{" "}
            <button
              onClick={() => navigate("/recruiter/login")}
              className="font-bold text-emerald-450 hover:text-emerald-300 text-emerald-400"
            >
              Institutional Login Instead
            </button>
          </p>

        </div>
      </div>
    );
  }

  // --- RENDER RECRUITER DASHBOARD ---
  if (isDashboard) {
    if (!user) {
      return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Please sign in as a corporate recruiter first.</h2>
            <button
              onClick={() => navigate("/recruiter/login")}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white"
            >
              Go to Recruiter Login
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 recruiter-glow pb-16">
        
        {/* API Missing Warn Banner */}
        {apiKeyMissingError && (
          <div className="bg-amber-50 border-b border-amber-200 p-4 shrink-0">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm text-slate-800">
                  <p className="font-bold">Missing/Invalid Gemini API Credentials Detected</p>
                  <p className="opacity-90">To perform semantic evaluations on applicant resumes and draft high-performance jobs, verify that an API key is available in the <strong>Settings &gt; Secrets</strong> workspace registry.</p>
                </div>
              </div>
              <button 
                onClick={() => setApiKeyMissingError(false)}
                className="text-xs font-bold text-amber-700 bg-amber-100 rounded px-2.5 py-1 transition"
              >
                Dismiss Notice
              </button>
            </div>
          </div>
        )}

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          
          {/* Dashboard Header Panel */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-200/50 pb-6 mb-8">
            <div className="space-y-1">
              <h1 className="font-display text-4xl font-extrabold tracking-tight text-slate-900">
                Hiring Officer Console 🏢
              </h1>
              <p className="text-slate-500 font-medium">
                Enterprise portal tracking <span className="font-bold text-emerald-600">{user.companyName || "CareerHub AI"}</span> listings.
              </p>
            </div>

            {/* Navigation Tabs bar */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-white border border-slate-200/80 shadow-md">
              <button
                type="button"
                onClick={() => setActiveTab("candidates")}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-bold leading-none transition ${
                  activeTab === "candidates"
                    ? "bg-slate-900 text-white shadow-xl"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Semantic Screening</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("pipeline")}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-bold leading-none transition ${
                  activeTab === "pipeline"
                    ? "bg-slate-900 text-white shadow-xl"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                <span>Hiring Pipeline</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("jobs")}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-bold leading-none transition ${
                  activeTab === "jobs"
                    ? "bg-slate-900 text-white shadow-xl"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <PlusCircle className="h-4 w-4" />
                <span>Manage listings</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("analytics")}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-bold leading-none transition ${
                  activeTab === "analytics"
                    ? "bg-slate-900 text-white shadow-xl"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Recruiter Analytics</span>
              </button>
            </div>
          </div>

          {/* Active Panel View */}
          <div className="bg-white rounded-3xl border border-slate-200/85 p-6 sm:p-8 shadow-xl shadow-slate-200/30">
            
            {/* TABS 1: SEMANTIC SCREENING & RANKING */}
            {activeTab === "candidates" && (
              <div className="space-y-8 animate-fade-in">
                <div className="space-y-2">
                  <h2 className="font-display text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-emerald-600" />
                    <span>Gemini Candidate Ranking Matrix</span>
                  </h2>
                  <p className="text-slate-500 text-sm">
                    Enter the requirements block to rank all resume indices against criteria semantically via Gemini.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                  {/* Left Criteria Box */}
                  <div className="lg:col-span-4 space-y-4">
                    <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3.5">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-bold uppercase text-slate-700 tracking-wider">Hiring Objectives</h3>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedJobDesc(`We are looking for candidate matching PM profiles:\n- Prior tenure APM or Coordinator in high-growth SaaS environments\n- Agile/PM metrics writing PRDs, roadmap coordinate in Jira`);
                          }}
                          className="text-[11px] font-bold text-emerald-600 hover:underline hover:text-emerald-800"
                        >
                          APM PM target
                        </button>
                      </div>
                      <textarea
                        rows={6}
                        required
                        value={selectedJobDesc}
                        onChange={(e) => setSelectedJobDesc(e.target.value)}
                        placeholder="Write or copy-paste target job descriptions and qualifications to rank..."
                        className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={runCandidateRanking}
                        disabled={rankingLoading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3 px-4 shadow-md transition disabled:opacity-50"
                      >
                        {rankingLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Comparing Candidates...</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Evaluate &amp; Rank via Gemini</span>
                          </>
                        )}
                      </button>
                    </div>

                    {rankingError && (
                      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-650">
                        {rankingError}
                      </div>
                    )}
                  </div>

                  {/* Right Score grid */}
                  <div className="lg:col-span-8 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Applied candidates listings ({candidates.length})
                    </h3>

                    <div className="space-y-4">
                      {candidates.map((cand) => (
                        <div 
                          key={cand.id} 
                          className="border border-slate-200 rounded-2xl bg-white p-5 space-y-4 shadow-sm hover:border-slate-350 hover:shadow-md transition-all"
                        >
                          {/* Top Row: Info + Score */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-display font-bold text-slate-900 text-base">{cand.name}</h4>
                                <span className="rounded bg-slate-100 border border-slate-200/50 px-2 py-0.5 text-[10px] font-bold text-slate-500 uppercase">{cand.status}</span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">{cand.currentRole} • {cand.experienceYears} Years exp • {cand.education}</p>
                            </div>

                            {cand.suitabilityScore !== undefined ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400 font-medium shrink-0">Match Rating:</span>
                                <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-white font-display font-extrabold text-sm ${
                                  cand.suitabilityScore >= 80 ? "bg-emerald-600 shadow-emerald-100 shadow-md" : cand.suitabilityScore >= 50 ? "bg-amber-600" : "bg-red-500"
                                }`}>
                                  {cand.suitabilityScore}%
                                </div>
                              </div>
                            ) : (
                              <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">NOT EVALUATED</span>
                            )}
                          </div>

                          {/* Quick skills */}
                          <div className="flex flex-wrap gap-1">
                            {cand.skills.map((s, idx) => (
                              <span key={idx} className="rounded bg-slate-50 border border-slate-100 text-[10px] font-mono text-slate-500 px-2 py-0.5">
                                {s}
                              </span>
                            ))}
                          </div>

                          {/* Detailed alignment criteria results */}
                          {cand.suitabilityScore !== undefined && (
                            <div className="border-t border-slate-100 pt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 animate-fade-in text-xs">
                              {/* Strengths summary */}
                              <div className="space-y-1.5 p-3 rounded-xl bg-emerald-50/30 border border-emerald-100/60 leading-relaxed text-slate-700">
                                <h5 className="font-bold text-emerald-800 flex items-center gap-1">
                                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                                  <span>Executive Strength</span>
                                </h5>
                                <p className="font-medium text-slate-650">{cand.strengthsSummary}</p>
                              </div>

                              {/* Critical Gaps list */}
                              <div className="space-y-1.5 p-3 rounded-xl bg-orange-50/20 border border-orange-100/40 text-slate-700 leading-relaxed">
                                <h5 className="font-bold text-orange-850 flex items-center gap-1">
                                  <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
                                  <span>Identified Gap Bottlenecks</span>
                                </h5>
                                <ul className="space-y-1 font-medium text-slate-650 list-disc list-inside">
                                  {cand.criticalGaps?.map((g, idx) => (
                                    <li key={idx}>{g}</li>
                                  ))}
                                  {(!cand.criticalGaps || cand.criticalGaps.length === 0) && (
                                    <li>No crucial skill gap detected.</li>
                                  )}
                                </ul>
                              </div>

                              {/* Proposed Screen questions */}
                              <div className="sm:col-span-2 space-y-1.5 p-4 rounded-xl border border-slate-200/60 bg-white">
                                <h5 className="font-bold text-slate-800 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                                  <BrainCircuit className="h-4 w-4 text-emerald-500 animate-pulse" />
                                  <span>Gemini Custom Recruitment Questions</span>
                                </h5>
                                <ol className="space-y-2 text-slate-600 font-semibold list-decimal list-inside pl-1 leading-relaxed">
                                  {cand.suggestedQuestions?.map((q, idx) => (
                                    <li key={idx} className="bg-slate-50/80 p-2 rounded-lg border border-slate-100">{q}</li>
                                  ))}
                                </ol>
                              </div>
                            </div>
                          )}

                          {/* Quick manual Pipeline status changer */}
                          <div className="flex flex-wrap items-center justify-between gap-4 pt-1 border-t border-slate-50">
                            <span className="text-xxs font-semibold uppercase font-mono text-slate-400">Push status pipeline</span>
                            <div className="flex gap-1">
                              {["Applied", "Screened", "Interviewing", "Offered", "Rejected"].map((st) => (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => updateCandidateStatus(cand.id, st as Candidate['status'])}
                                  className={`rounded-lg px-2.5 py-1 text-xxs font-bold cursor-pointer transition ${
                                    cand.status === st
                                      ? "bg-emerald-600 text-white"
                                      : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
                                  }`}
                                >
                                  {st}
                                </button>
                              ))}
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TABS 2: KANBAN PIPELINE BOARD */}
            {activeTab === "pipeline" && (
              <div className="space-y-6 animate-fade-in text-left">
                <div className="space-y-1">
                  <h2 className="font-display text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-emerald-600" />
                    <span>Dynamic Kanban Pipeline Organizer</span>
                  </h2>
                  <p className="text-slate-500 text-sm">
                    Review and reorganize applicant hiring stages by clicking status controls.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  {/* Columns definitions */}
                  {(["Applied", "Screened", "Interviewing", "Offered", "Rejected"] as Candidate['status'][]).map((stage) => {
                    const colCandidates = candidates.filter(c => c.status === stage);

                    return (
                      <div key={stage} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 shrink-0 flex flex-col justify-between">
                        <div className="flex justify-between items-center bg-white border border-slate-150 p-2 rounded-xl">
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">{stage}</span>
                          <span className="rounded-full bg-slate-200/50 px-2.5 py-0.5 text-xs font-extrabold leading-none">{colCandidates.length}</span>
                        </div>

                        <div className="space-y-2 flex-grow min-h-[300px]">
                          {colCandidates.map(c => (
                            <div 
                              key={c.id} 
                              className="bg-white border border-slate-200/80 p-3.5 rounded-xl shadow-sm hover:border-emerald-300 transition"
                            >
                              <h4 className="text-xs font-bold text-slate-800 leading-none">{c.name}</h4>
                              <p className="text-[10px] text-slate-400 mt-1 leading-none">{c.currentRole}</p>
                              
                              {c.suitabilityScore !== undefined && (
                                <div className="mt-2 text-xxs font-mono font-bold text-emerald-650 bg-emerald-50 px-1.5 py-0.5 rounded inline-block">
                                  {c.suitabilityScore}% Match
                                </div>
                              )}

                              {/* Cycle button */}
                              <div className="mt-3 flex gap-1 justify-end">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const sequence: Candidate['status'][] = ["Applied", "Screened", "Interviewing", "Offered", "Rejected"];
                                    const nextIdx = (sequence.indexOf(stage) + 1) % sequence.length;
                                    updateCandidateStatus(c.id, sequence[nextIdx]);
                                  }}
                                  className="text-[10px] font-bold text-slate-450 hover:text-slate-700 hover:underline flex items-center gap-0.5"
                                  title="Cycle to next hiring stage"
                                >
                                  <span>Move status</span>
                                  <ChevronRight className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          ))}

                          {colCandidates.length === 0 && (
                            <div className="h-full flex items-center justify-center p-4 rounded text-center text-slate-300 font-semibold text-xxs">
                              Empty Stage
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TABS 3: CREATE & MANAGE LISTINGS */}
            {activeTab === "jobs" && (
              <div className="space-y-8 animate-fade-in text-left">
                <div className="space-y-2">
                  <h2 className="font-display text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                    <PlusCircle className="h-6 w-6 text-emerald-600" />
                    <span>Hiring Listings Manager</span>
                  </h2>
                  <p className="text-slate-500 text-xs">
                    Write standard job attributes and let Gemini compile high-performance descriptions instantly.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                  {/* Left Form: Generate via Gemini */}
                  <form onSubmit={handleGenerateJobListing} className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1">
                      <Sparkles className="h-4.5 w-4.5 text-emerald-600" />
                      <span>Gemini Job Compiler Tools</span>
                    </h3>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Target Job Title</label>
                      <input
                        type="text"
                        required
                        value={newJobTitle}
                        onChange={(e) => setNewJobTitle(e.target.value)}
                        placeholder="e.g. Back-end Node.js Lead"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                      <select
                        value={newJobDept}
                        onChange={(e) => setNewJobDept(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-sm font-semibold text-slate-900 outline-none cursor-pointer"
                      >
                        <option value="Engineering">Engineering & Ops</option>
                        <option value="Product Management">Product Management</option>
                        <option value="Marketing">Growth Marketing / Strategy</option>
                        <option value="Sales">Corporate Account Executive</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={genLoading}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3 px-4 shadow-md transition disabled:opacity-50"
                    >
                      {genLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Gemini compiling PRD/listings parameters...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 text-emerald-400" />
                          <span>Generate listing via Gemini AI</span>
                        </>
                      )}
                    </button>

                    {genError && (
                      <div className="rounded-xl bg-red-50 p-4 border border-red-100 text-xs text-red-600">
                        {genError}
                      </div>
                    )}
                  </form>

                  {/* Right listings list */}
                  <div className="lg:col-span-7 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Corporate Board listings</h3>
                    
                    <div className="space-y-4">
                      {jobPostings.map((job) => (
                        <div key={job.id} className="border border-slate-200 rounded-2xl bg-white p-5 space-y-3.5 shadow-sm">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-display font-extrabold text-slate-900 text-base leading-none">{job.title}</h4>
                                <span className="rounded bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700 uppercase leading-none">{job.status}</span>
                              </div>
                              <p className="text-[11px] text-slate-400 font-medium font-mono mt-1.5">{job.department} • {job.location} • {job.salary}</p>
                            </div>
                            <span className="rounded-lg bg-slate-100 font-mono text-[10px] font-bold text-slate-500 px-2 py-1 leading-none shrink-0" title="Active applicants count">{job.applicantsCount} Applicants</span>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed font-semibold">{job.description}</p>

                          <div className="space-y-1.5 border-t border-slate-50 pt-3">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Target requirements checklist</span>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xxs text-slate-550 leading-relaxed">
                              {job.requirements?.map((reqItem, idx) => (
                                <li key={idx} className="flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3 text-emerald-500 shrink-0" />
                                  <span className="truncate">{reqItem}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TABS 4: ANALYTICS */}
            {activeTab === "analytics" && (
              <div className="space-y-6 animate-fade-in text-left">
                <div className="space-y-1">
                  <h2 className="font-display text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                    <BarChart3 className="h-6 w-6 text-emerald-600" />
                    <span>Recruiter Analytics metrics</span>
                  </h2>
                  <p className="text-slate-500 text-sm">
                    Evaluate hiring metrics, screening conversion ratios, and semantic compatibility index vectors.
                  </p>
                </div>

                {/* Grid stats cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 shadow-sm">
                    <span className="text-[10px] font-mono leading-none font-bold uppercase text-slate-400">Candidates Audited</span>
                    <h3 className="font-display text-3xl font-extrabold text-slate-900">{totalApps}</h3>
                    <p className="text-[10px] text-slate-400 leading-tight">Total applicant resumes indexed.</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 shadow-sm">
                    <span className="text-[10px] font-mono leading-none font-bold uppercase text-emerald-600">Screening Conversion</span>
                    <h3 className="font-display text-3xl font-extrabold text-emerald-700">{Math.round((screenedCount / totalApps) * 100) || 0}%</h3>
                    <p className="text-[10px] text-slate-405 leading-tight">Percentage moved beyond first stage.</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 shadow-sm">
                    <span className="text-[10px] font-mono leading-none font-bold uppercase text-indigo-600">Interviewing Active</span>
                    <h3 className="font-display text-3xl font-extrabold text-indigo-700">{interviewingCount}</h3>
                    <p className="text-[10px] text-slate-405 leading-tight">Currently scheduled in chat coach.</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2 shadow-sm">
                    <span className="text-[10px] font-mono leading-none font-bold uppercase text-slate-500">Average Match Index</span>
                    <h3 className="font-display text-3xl font-extrabold text-slate-900">{averageSuitScore}%</h3>
                    <p className="text-[10px] text-slate-405 leading-tight">Overall alignment math score.</p>
                  </div>
                </div>

                {/* Layout details */}
                <div className="border border-slate-200/80 rounded-2xl bg-slate-50/50 p-6 space-y-4">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Hiring Pipeline Convert distribution</h3>
                  
                  <div className="space-y-3.5">
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-600">Applied (First screen stage)</span>
                        <span className="text-slate-900">{candidates.filter(c => c.status === "Applied").length} candidates</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-500" style={{ width: `${(candidates.filter(c => c.status === "Applied").length / totalApps) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-emerald-700">Screened (ATS Audited)</span>
                        <span className="text-slate-900">{candidates.filter(c => c.status === "Screened").length} candidates</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600" style={{ width: `${(candidates.filter(c => c.status === "Screened").length / totalApps) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-indigo-700">Interviewing (Active Coach conversations)</span>
                        <span className="text-slate-900">{interviewingCount} candidates</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-650" style={{ width: `${(interviewingCount / totalApps) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-emerald-800 font-bold">Closed Offers Issued</span>
                        <span className="text-emerald-800 font-bold">{offeredCount} offers</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${(offeredCount / totalApps) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>
      </div>
    );
  }

  return null;
}
