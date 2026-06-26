import React, { useState, useEffect, useRef } from "react";
import { UserSession, ResumeAnalysisResult, InterviewMessage } from "../types";
import { 
  Sparkles, FileText, Send, CheckCircle2, ChevronRight, AlertTriangle, Play,
  ArrowRight, Mail, Lock, User as UserIcon, Award, Compass, ThumbsUp, HelpCircle, 
  MapPin, Loader2, DollarSign, BrainCircuit, RefreshCw, Layers, Phone, ShieldCheck, AlertCircle, Info,
  Copy, ChevronDown, ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// For real Firebase SDK Authentication
import { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  googleProvider, 
  RecaptchaVerifier, 
  signInWithPhoneNumber 
} from "../lib/firebase";
import { signInWithPopup } from "firebase/auth";

interface StudentZoneProps {
  currentPath: string;
  navigate: (path: string) => void;
  user: UserSession | null;
  loginUser: (session: UserSession) => void;
}

// Initial Mock Job List for matching
const AVAILABLE_JOBS = [
  {
    id: "job-1",
    title: "Senior AI Engineer",
    company: "CareerHub Enterprise",
    location: "San Francisco, CA (Hybrid)",
    salary: "$160,000 - $210,000",
    skills: ["React", "TypeScript", "Python", "LLMs", "Vector Databases", "GCP"],
    description: "Build semantic parsing filters, custom LLM fine-tunes, and coordinate scalable vector backends."
  },
  {
    id: "job-2",
    title: "SaaS Product Coordinator",
    company: "SaaSify Logistics Inc",
    location: "Remote (USA/Canada)",
    salary: "$90,000 - $125,000",
    skills: ["Product Roadmap", "Agile", "PRDs", "Excel", "User Research", "SaaS"],
    description: "Write rigorous PRDs, design sprints, maintain key metrics, and coordinate customer focus test circles."
  },
  {
    id: "job-3",
    title: "Full Stack Software Trainee",
    company: "DevSprint Corp",
    location: "Austin, TX (In-Office)",
    salary: "$70,000 - $85,000",
    skills: ["React", "TypeScript", "CSS", "Node.js", "Basic SQL"],
    description: "Accelerate frontend page deployment pipelines, optimize responsive HTML/CSS sheets, and coordinate with database leads."
  }
];

export function StudentZone({ currentPath, navigate, user, loginUser }: StudentZoneProps) {
  // Navigation Routing States
  const isLogin = currentPath === "/student/login";
  const isRegister = currentPath === "/student/register";
  const isDashboard = currentPath === "/student/dashboard";

  // Login Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [loading, setLoading] = useState(false);

  // New Firebase Auth Integration States
  const [authMode, setAuthMode] = useState<'email' | 'phone'>('email');
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [successText, setSuccessText] = useState("");
  const [showFirebaseHelper, setShowFirebaseHelper] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Registration Form States
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regCollege, setRegCollege] = useState("");
  const [regTargetTitle, setRegTargetTitle] = useState("Software Engineer");
  const [regSkills, setRegSkills] = useState("React, HTML, CSS, JavaScript");

  // Dashboard Tab Management: 'ats' | 'coach' | 'jobs' | 'gap'
  const [activeTab, setActiveTab] = useState<'ats' | 'coach' | 'jobs' | 'gap'>('ats');

  // --- FEATURE - ATS RESUME ANALYZER STATES ---
  const [resumeText, setResumeText] = useState("");
  const [customJobDesc, setCustomJobDesc] = useState("");
  const [expectedRole, setExpectedRole] = useState("Software Engineer");
  const [atsResult, setAtsResult] = useState<ResumeAnalysisResult | null>(null);
  const [atsLoading, setAtsLoading] = useState(false);
  const [atsError, setAtsError] = useState("");

  // --- FEATURE - INTERVIEW COACH STATES ---
  const [coachMessages, setCoachMessages] = useState<InterviewMessage[]>([]);
  const [userAnswer, setUserAnswer] = useState("");
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachError, setCoachError] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // --- STATE FOR DISMISSIBLE WARNING ---
  const [apiKeyMissingError, setApiKeyMissingError] = useState(false);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [coachMessages]);

  // Load Initial Interview Coaching when entering tab
  const handleStartInterview = async (title: string) => {
    setCoachLoading(true);
    setCoachError("");
    try {
      const response = await fetch("/api/interview/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [],
          jobTitle: title,
          lastUserMessage: ""
        })
      });

      if (!response.ok) {
        const errObj = await response.json();
        throw new Error(errObj.details || errObj.error || "Failed to contact engine");
      }

      const data = await response.json();
      const firstAIMsg: InterviewMessage = {
        id: "start-ai",
        role: "model",
        text: data.nextQuestion || "Welcome! Let's begin the interview. Can you describe an impressive technical or structural project you've built?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        feedback: data.feedback || "AI System connected."
      };
      setCoachMessages([firstAIMsg]);
    } catch (err: any) {
      console.error(err);
      setCoachError(err.message || "Could not spin up interview workshop.");
      if (err.message?.includes("GEMINI_API_KEY")) {
        setApiKeyMissingError(true);
      }
    } finally {
      setCoachLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "coach" && coachMessages.length === 0 && user) {
      const title = regTargetTitle || "Software Engineer";
      handleStartInterview(title);
    }
  }, [activeTab]);

  // 1. Firebase Recaptcha Setup Helper
  const setupRecaptcha = () => {
    try {
      // Clear container and ensure it exists
      const container = document.getElementById("recaptcha-container");
      if (!container) {
        console.warn("recaptcha-container element not found in DOM");
        return null;
      }
      
      // Clear any previous captcha widgets
      container.innerHTML = '<div id="recaptcha-widget"></div>';
      
      const verifier = new RecaptchaVerifier(auth, "recaptcha-widget", {
        size: "invisible",
        callback: () => {
          console.log("Invisible recaptcha solved successfully");
        }
      });
      return verifier;
    } catch (err) {
      console.error("Recaptcha verification initialization error:", err);
      return null;
    }
  };

  // 2. Submit Email Login Handler (Real Firebase Auth)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorText("Please fill out both email and password blocks.");
      return;
    }
    setLoading(true);
    setErrorText("");
    setSuccessText("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const fsUser = userCredential.user;
      loginUser({
        email: fsUser.email || email,
        name: fsUser.displayName || email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
        role: "ROLE_STUDENT",
        token: await fsUser.getIdToken()
      });
      setSuccessText("Successfully matched and connected via Firebase Auth!");
      setTimeout(() => navigate("/student/dashboard"), 400);
    } catch (err: any) {
      console.error("Firebase Login Mismatch", err);
      let friendlyMessage = err.message || "";
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        friendlyMessage = "No account matching those credentials was found. Please register first below, or use the Simulator option if your Firebase project is in sandbox mode.";
      }
      setErrorText(`Firebase Authenticaton Error: ${friendlyMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // 3. Submit Email Register Handler (Real Firebase Auth)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) {
      setErrorText("All main credentials (name, email, password) are required for registration.");
      return;
    }
    setLoading(true);
    setErrorText("");
    setSuccessText("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, regEmail, regPassword);
      const fsUser = userCredential.user;
      loginUser({
        email: fsUser.email || regEmail,
        name: regName,
        role: "ROLE_STUDENT",
        token: await fsUser.getIdToken()
      });
      setSuccessText(`Successfully created user ${regName} in your Firebase Auth Database!`);
      setTimeout(() => navigate("/student/dashboard"), 400);
    } catch (err: any) {
      console.error("Firebase Auth Registration Mismatch", err);
      let friendlyMessage = err.message || "";
      if (err.code === "auth/email-already-in-use") {
        friendlyMessage = "Secure email already in use. Try signing in instead, or try a different email block.";
      } else if (err.code === "auth/weak-password") {
        friendlyMessage = "The password is too weak. Please ensure it is at least 6 characters.";
      }
      setErrorText(`Firebase Registration Error: ${friendlyMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // 4. Send SMS Verification (Real Firebase Phone Auth)
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 7) {
      setErrorText("Please provide a valid phone number with country code (e.g. +14155552671).");
      return;
    }
    setLoading(true);
    setErrorText("");
    setSuccessText("");

    try {
      const verifier = setupRecaptcha();
      if (!verifier) {
        throw new Error("Recaptcha container element failed initialization. Please ensure you are viewing on a supported browser.");
      }
      
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      setConfirmationResult(confirmation);
      setIsOtpSent(true);
      setSuccessText(`SMS passcode successfully sent to ${phoneNumber}! Check your mobile device.`);
    } catch (err: any) {
      console.error("Firebase Phone SMS initialization error:", err);
      let friendlyMessage = err.message || "";
      if (err.code === "auth/invalid-phone-number") {
        friendlyMessage = "Formatted phone number is invalid. Ensure it has the country prefix like +1 (e.g., +15551234567).";
      } else if (err.code === "auth/captcha-check-failed") {
        friendlyMessage = "Captcha check failed. Ensure standard viewport/cookies are supported on your domain.";
      } else if (err.code === "auth/operation-not-allowed" || err.message?.includes("operation-not-allowed")) {
        friendlyMessage = "Phone SMS sign-in is disabled in your Firebase Console. Please follow step 2 in the detailed beginner instructions below to enable Phone Authentication.";
      } else if (err.message?.includes("fetch") || err.message?.includes("Failed to fetch") || err.code === "auth/network-request-failed") {
        friendlyMessage = "Secure network request failed. You need to register your live run.app preview URL inside the Firebase Authorized Domains list. Follow step 3 in the beginner guide below.";
      }
      setErrorText(`Firebase Phone Auth Error: ${friendlyMessage}`);
      setShowFirebaseHelper(true);
    } finally {
      setLoading(false);
    }
  };

  // 5. Verify SMS Verification (Real Firebase Phone Auth confirmation)
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      setErrorText("Please supply the exactly 6-digit confirmation code.");
      return;
    }
    setLoading(true);
    setErrorText("");
    setSuccessText("");

    try {
      if (!confirmationResult) {
        throw new Error("Activation credentials expired. Please resend the validation SMS wrapper.");
      }
      
      const result = await confirmationResult.confirm(otpCode);
      const fsUser = result.user;
      loginUser({
        email: `${phoneNumber.replace(/\D/g, "")}@phone.careerhub.ai`,
        name: `Verified Student (${phoneNumber})`,
        role: "ROLE_STUDENT",
        token: await fsUser.getIdToken()
      });
      setSuccessText("Phone number verified successfully!");
      setTimeout(() => navigate("/student/dashboard"), 400);
    } catch (err: any) {
      console.error("Firebase OTP Mismatch:", err);
      let friendlyMessage = err.message || "Invalid OTP code. Please trace and enter again.";
      if (err.message?.includes("fetch")) {
        friendlyMessage = "Network failed to authorize. Refer to the Authorized Domains section in the details guide below.";
      }
      setErrorText(`OTP verification error: ${friendlyMessage}`);
      setShowFirebaseHelper(true);
    } finally {
      setLoading(false);
    }
  };

  // 6. Real Google OAuth Firebase Pop-up
  const handleGoogleLoginReal = async () => {
    setLoading(true);
    setErrorText("");
    setSuccessText("");
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const fsUser = userCredential.user;
      loginUser({
        email: fsUser.email || "student.google@gmail.com",
        name: fsUser.displayName || "Google Authenticated User",
        role: "ROLE_STUDENT",
        token: await fsUser.getIdToken()
      });
      setSuccessText(`Logged in as key Google User: ${fsUser.displayName || fsUser.email}`);
      setTimeout(() => navigate("/student/dashboard"), 400);
    } catch (err: any) {
      console.error("Google Auth Popup Mismatch", err);
      let friendlyMessage = err.message || "";
      if (err.code === "auth/popup-blocked") {
        friendlyMessage = "Sign-In popup got blocked. Please disable your browser's popup shields, open in a new tab, or use standard Email login.";
      } else if (err.code === "auth/operation-not-allowed" || err.message?.includes("operation-not-allowed")) {
        friendlyMessage = "Google Sign-In is disabled in your Firebase console. Please follow step 1 in the detailed beginner instructions below to enable Google authentication.";
      } else if (err.message?.includes("fetch") || err.message?.includes("Failed to fetch") || err.code === "auth/network-request-failed") {
        friendlyMessage = "Google login fetch request blocked. You must register your live preview URL in your Firebase Console's Authorized Domains list. Follow step 3 below.";
      }
      setErrorText(`Google Firebase Popup Error: ${friendlyMessage}`);
      setShowFirebaseHelper(true);
    } finally {
      setLoading(false);
    }
  };

  // 7. Security Auditor & Sandbox Fast-Simulate Option
  const handleGoogleMock = () => {
    loginUser({
      email: "google.student@university.edu",
      name: "Google Student Account",
      role: "ROLE_STUDENT",
      token: "GOOGLE_OAUTH_TOKEN_ACTIVE"
    });
    navigate("/student/dashboard");
  };

  // 4. ATS Resume Submit
  const handleAtsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim()) {
      setAtsError("Resume text content cannot be blank. Copy/paste or write yours to analyze.");
      return;
    }
    
    setAtsLoading(true);
    setAtsError("");
    setAtsResult(null);

    try {
      const resp = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          jobDescription: customJobDesc,
          expectedRole
        })
      });

      if (!resp.ok) {
        const errObj = await resp.json();
        throw new Error(errObj.details || errObj.error || "Resume scanner lookup failed.");
      }

      const resData = await resp.json();
      setAtsResult(resData);
    } catch (err: any) {
      console.error(err);
      setAtsError(err.message || "An error occurred while speaking to the ATS scanner.");
      if (err.message?.includes("GEMINI_API_KEY")) {
        setApiKeyMissingError(true);
      }
    } finally {
      setAtsLoading(false);
    }
  };

  // 5. Send Chat Message to Interview Coach
  const handleSendInterviewMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim() || coachLoading) return;

    const userMsg: InterviewMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      text: userAnswer.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const nextHistory = [...coachMessages, userMsg];
    setCoachMessages(nextHistory);
    setUserAnswer("");
    setCoachLoading(true);
    setCoachError("");

    try {
      const targetTitle = regTargetTitle || "Software Engineer";
      const resp = await fetch("/api/interview/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextHistory,
          jobTitle: targetTitle,
          lastUserMessage: userMsg.text
        })
      });

      if (!resp.ok) {
        const errObj = await resp.json();
        throw new Error(errObj.details || errObj.error || "Interactive session terminated.");
      }

      const data = await resp.json();
      const aiResponse: InterviewMessage = {
        id: `ai-${Date.now()}`,
        role: "model",
        text: data.nextQuestion || "Excellent strategy. Moving forward, how do you handle intense task conflicts in agile sprints under close release deadlines?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        feedback: data.feedback
      };

      setCoachMessages(prev => [...prev, aiResponse]);
    } catch (err: any) {
      console.error(err);
      setCoachError(err.message || "Error keeping chat alive. Check connection.");
      if (err.message?.includes("GEMINI_API_KEY")) {
        setApiKeyMissingError(true);
      }
    } finally {
      setCoachLoading(false);
    }
  };

  // --- RENDER LOGIN VIEW ---
  if (isLogin) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 sm:px-6 lg:px-8 student-glow transition-all">
        <div className="w-full max-w-lg space-y-8 rounded-3xl border border-indigo-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl shadow-indigo-100/30 dark:shadow-none">
          
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
              Launch Your Career
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-450">
              Select your authenticated route to review resumes, prepare interviews, and audit skills.
            </p>
          </div>

          {/* New Authentication Method Toggle Bars */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200/50 dark:border-slate-800">
            <button
              type="button"
              onClick={() => { setAuthMode('email'); setErrorText(""); }}
              className={`py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                authMode === 'email' 
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              Email & Password
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('phone'); setErrorText(""); }}
              className={`py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                authMode === 'phone'
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              Phone Number OTP
            </button>
          </div>

          {/* Success messages alerts */}
          {successText && (
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-4 text-xs text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900 flex items-center gap-2.5 animate-fade-in">
              <ShieldCheck className="h-4.5 w-4.5 shrink-0 text-emerald-500" />
              <span className="font-medium">{successText}</span>
            </div>
          )}

          {/* Error messages alerts */}
          {errorText && (
            <div className="rounded-xl bg-red-50 dark:bg-red-950/40 p-4 text-xs text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50 flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-500 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold block">Authentication Update:</span>
                <p className="leading-relaxed">{errorText}</p>
              </div>
            </div>
          )}

          {/* Auth Forms view conditional rendering */}
          {authMode === 'email' ? (
            /* ==================================
               EMAIL & PASSWORD FIREBASE AUTHENTICATION
               ================================== */
            <form className="space-y-5" onSubmit={handleLoginSubmit}>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Student Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                    <Mail className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex.sterling@university.edu"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 py-3 pl-10 pr-4 text-sm font-medium text-slate-900 dark:text-white outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Security Password
                  </label>
                  <button
                    type="button"
                    onClick={() => alert("Firebase tip: For dynamic production login, use standard sign up in registration form below to persist credentials in your project!")}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                    <Lock className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 py-3 pl-10 pr-4 text-sm font-medium text-slate-900 dark:text-white outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 h-4 w-4 accent-indigo-600 cursor-pointer"
                  />
                  <span>Remember Email Session</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 dark:bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg hover:bg-indigo-700 transition cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>Signing in via Firebase Auth...</span>
                  </>
                ) : (
                  <span>Login with Firebase</span>
                )}
              </button>
            </form>
          ) : (
            /* ==================================
               PHONE NUMBER OTP AUTHENTICATION
               ================================== */
            <div className="space-y-5 animate-fade-in">
              {/* Recaptcha placement target */}
              <div id="recaptcha-container" className="my-2"></div>

              {!isOtpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Phone Number (With Country Prefix)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                        <Phone className="h-4.5 w-4.5 text-indigo-500" />
                      </span>
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+15550199"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 py-3 pl-10 pr-4 text-sm font-medium text-slate-900 dark:text-white outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <span className="text-xxs text-slate-400 dark:text-slate-500 block mt-1.5 font-medium leading-relaxed leading-none">
                      💡 beginners tip: Use standard international formatting (e.g. +14155552671). Ensure Phone auth is enabled in your Firebase dashboard!
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg hover:bg-indigo-700 transition cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                        <span>Sending SMS Validation...</span>
                      </>
                    ) : (
                      <span>Send OTP Passcode SMS</span>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        6-Digit OTP Verification Code
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsOtpSent(false)}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Change Number
                      </button>
                    </div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                        <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
                      </span>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="123456"
                        className="w-full tracking-widest text-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 py-3 pl-10 pr-4 text-sm font-extrabold text-slate-900 dark:text-white outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg hover:bg-emerald-700 transition cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                        <span>Verifying OTP Passcode...</span>
                      </>
                    ) : (
                      <span>Confirm Code & Login</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ==================================
             SOCIAL LOGINS (GMAIL / GOOGLE SIGN IN)
             ================================== */}
          <div className="relative flex items-center justify-center my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100 dark:border-slate-800" />
            </div>
            <span className="relative bg-white dark:bg-slate-900 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
              Or Connect
            </span>
          </div>

          <div className="space-y-4">
            {/* Real Google OAuth Login */}
            <button
              type="button"
              onClick={handleGoogleLoginReal}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
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
              <span>Continue with Gmail (Google Popup)</span>
            </button>

            {/* Beginner Quick Guide and Rapid Swap block & Setup steps */}
            <div className="rounded-2xl border border-indigo-100 dark:border-slate-800 bg-indigo-50/5 dark:bg-slate-950/20 p-4 space-y-4 shadow-sm">
              <div 
                className="flex items-center justify-between cursor-pointer select-none"
                onClick={() => setShowFirebaseHelper(!showFirebaseHelper)}
              >
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 hover:opacity-90">
                  <Info className="h-5 w-5 shrink-0" />
                  <span className="text-sm font-bold tracking-tight">Beginners Firebase Setup Guide</span>
                </div>
                <div className="text-slate-400 dark:text-slate-500">
                  {showFirebaseHelper ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </div>

              {!showFirebaseHelper ? (
                <div className="space-y-3">
                  <p className="text-xxs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                    We've connected fully-featured Firebase Authentication for Email, Phone SMS, and Google accounts. If some operations are blocked, click to see our step-by-step console guide or use the fast simulator:
                  </p>
                  
                  <button
                    type="button"
                    onClick={handleGoogleMock}
                    className="w-full rounded-xl bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/10 px-3 py-2 text-xxs font-bold text-indigo-600 dark:text-indigo-400 text-center transition cursor-pointer"
                  >
                    ⚡ Fast Sandbox Bypass (Simulate Developer Login)
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowFirebaseHelper(true)}
                    className="w-full text-center text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline transition-all mt-1"
                  >
                    Read Detailed Firebase Configuration Steps &rarr;
                  </button>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in border-t border-slate-100 dark:border-slate-800/80 pt-3">
                  <div className="text-xxs font-semibold text-slate-400 uppercase tracking-widest block mb-1">
                    🔧 Complete Pin-to-Pin Steps
                  </div>

                  {/* Step 1 */}
                  <div className="flex items-start gap-2.5">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                      1
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Enable Google Sign-In Provider</h4>
                      <p className="text-xxs text-slate-500 dark:text-slate-450 leading-relaxed">
                        Navigate to your <strong className="text-indigo-600 dark:text-indigo-400">Firebase Console</strong>, choose <strong className="text-slate-700 dark:text-slate-350">Authentication</strong> &gt; <strong className="text-slate-700 dark:text-slate-350">Sign-in method</strong>. Click <em>Add new provider</em>, choose <strong className="text-slate-800 dark:text-slate-200">Google</strong>, click <strong>Enable</strong>, specify a server support email, and save.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-2.5">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                      2
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Enable Phone SMS Authentication</h4>
                      <p className="text-xxs text-slate-500 dark:text-slate-450 leading-relaxed">
                        In the same <strong className="text-slate-700 dark:text-slate-350">Sign-in method</strong> section, click <em>Add new provider</em>, select <strong className="text-slate-800 dark:text-slate-200">Phone</strong>, flip the switch to <strong>Enable</strong>, and click <strong>Save</strong>. (This resolves the `auth/operation-not-allowed` error!).
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-2.5">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                      3
                    </div>
                    <div className="space-y-2 w-full">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Authorize Current Domain</h4>
                      <p className="text-xxs text-slate-500 dark:text-slate-450 leading-relaxed font-medium">
                        To avoid `Failed to fetch` or popup blocked screens, you must register your preview domain under the authorized domain list:
                      </p>
                      <div className="rounded-xl bg-slate-100 dark:bg-slate-950 p-2.5 border border-slate-200/60 dark:border-slate-800 space-y-1.5">
                        <span className="text-xxs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block leading-none">Your Preview Domain:</span>
                        <div className="flex items-center justify-between gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-lg">
                          <code className="text-xxs text-indigo-600 dark:text-indigo-400 font-mono select-all break-all">{window.location.hostname}</code>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(window.location.hostname);
                              setCopiedText(true);
                              setTimeout(() => setCopiedText(false), 2000);
                            }}
                            className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                            title="Copy Domain Name"
                          >
                            <Copy className="h-4 w-4 shrink-0" />
                          </button>
                        </div>
                        {copiedText && (
                          <span className="text-xxxs text-emerald-600 dark:text-emerald-400 font-bold block animate-pulse">
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&thinsp;&thinsp;&#10003;&nbsp;Copied to clip! Ready to paste into Firebase Settings.
                          </span>
                        )}
                        <p className="text-xxxs text-slate-500 dark:text-slate-400 font-medium">
                          💡 Go to <strong className="text-slate-600 dark:text-slate-300">Settings</strong> (gear icon next to Project Overview) &gt; <strong className="text-slate-600 dark:text-slate-300">Authorized Domains</strong>, click <strong className="text-indigo-600 dark:text-indigo-400">Add domain</strong>, paste this hostname, and Save!
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* fast bypass */}
                  <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 space-y-2">
                    <span className="text-xxs font-bold text-indigo-600 dark:text-indigo-400 uppercase block tracking-wider">
                      Still experiencing issues?
                    </span>
                    <p className="text-xxs text-slate-500 dark:text-slate-400 leading-relaxed">
                      If you haven't linked your Firebase Console yet or want rapid offline test sessions, bypass security constraints using the quick simulator below:
                    </p>
                    <button
                      type="button"
                      onClick={handleGoogleMock}
                      className="w-full rounded-xl bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 px-3 py-2 text-xxs font-extrabold text-indigo-600 dark:text-indigo-400 text-center transition cursor-pointer"
                    >
                      ⚡ Fast Sandbox Bypass (Simulate Developer Login)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Registration toggle path link */}
            <button
              type="button"
              onClick={() => navigate("/student/register")}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-indigo-50 dark:border-slate-850 bg-indigo-50/20 dark:bg-slate-900/40 py-3 text-sm font-bold text-indigo-700 dark:text-indigo-400 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <span>Create New Student Account</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>
      </div>
    );
  }

  // --- RENDER REGISTRATION VIEW ---
  if (isRegister) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-4 py-8 sm:px-6 lg:px-8 student-glow">
        <div className="w-full max-w-xl space-y-6 rounded-3xl border border-indigo-100 bg-white p-8 shadow-xl shadow-indigo-100/30 animate-fade-in">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">New Account</span>
            <h2 className="font-display text-2xl font-extrabold text-slate-900 mt-2">
              Begin Your Career Journey
            </h2>
            <p className="text-sm text-slate-500">
              Configure your career objectives and skills to sync with Gemini.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleRegisterSubmit}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Alexander Sterling"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/55 py-2.5 px-3.5 text-sm font-medium outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">University / School</label>
                <input
                  type="text"
                  required
                  value={regCollege}
                  onChange={(e) => setRegCollege(e.target.value)}
                  placeholder="Stanford University"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/55 py-2.5 px-3.5 text-sm font-medium outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Primary Email Address</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="alex.st@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/55 py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Security Password</label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/55 py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 leading-none">
                <Award className="h-4 w-4 text-indigo-500" />
                <span>AI Profile Optimization Settings</span>
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Professional Role</label>
                  <select
                    value={regTargetTitle}
                    onChange={(e) => setRegTargetTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-sm font-semibold text-slate-900 outline-none cursor-pointer"
                  >
                    <option value="Software Engineer">Software Engineer (Web/FullStack)</option>
                    <option value="Senior AI Engineer">Senior AI Engineer (LLMs/RAG)</option>
                    <option value="SaaS Product Coordinator">SaaS Product Coordinator</option>
                    <option value="Data Scientist">Data Scientist</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Core Tech Skills (comma separated)</label>
                  <input
                    type="text"
                    required
                    value={regSkills}
                    onChange={(e) => setRegSkills(e.target.value)}
                    placeholder="React, TypeScript, Python, LLMs"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/55 py-2.5 px-3.5 text-sm outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg hover:bg-indigo-700 transition"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Provisioning student credentials...</span>
                </>
              ) : (
                <span>Register with CareerHub AI</span>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-4">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/student/login")}
              className="font-bold text-indigo-600 hover:text-indigo-800"
            >
              Login Instead
            </button>
          </p>

        </div>
      </div>
    );
  }

  // --- RENDER STUDENT DASHBOARD VIEW ---
  if (isDashboard) {
    if (!user) {
      return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Please sign in as a student to access this portal.</h2>
            <button
              onClick={() => navigate("/student/login")}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white"
            >
              Go to Student Login
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 student-glow pb-16">
        
        {/* Gemini API Key Check Banner */}
        {apiKeyMissingError && (
          <div className="bg-amber-50 border-b border-amber-200 p-4">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-900">
                  <p className="font-semibold">Missing/Invalid Gemini API Key</p>
                  <p className="opacity-90">To interact with our live AI resume checker & chat tools, apply your API key in the <strong>Settings &gt; Secrets</strong> panel inside the AI Studio environment, or set GEMINI_API_KEY inside <code>.env</code> file.</p>
                </div>
              </div>
              <button 
                onClick={() => setApiKeyMissingError(false)}
                className="text-xs font-semibold text-amber-700 hover:text-amber-900 bg-amber-100 rounded px-2 py-1 transition"
              >
                Dismiss Notice
              </button>
            </div>
          </div>
        )}

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          
          {/* Top welcome profile bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-200/50 pb-6 mb-8">
            <div className="space-y-1">
              <h1 className="font-display text-4xl font-extrabold tracking-tight text-slate-900">
                Career Flight Control 🚀
              </h1>
              <p className="text-slate-500 font-medium">
                Welcome back, <span className="font-bold text-slate-800">{user.name}</span>. Target Career Role: <span className="font-bold text-indigo-600">{regTargetTitle || "Software Engineer"}</span>
              </p>
            </div>

            {/* Dashboard Sidebar Tabs Trigger */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-white border border-slate-200/80 shadow-md">
              <button
                type="button"
                onClick={() => setActiveTab("ats")}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-bold leading-none transition ${
                  activeTab === "ats"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>ATS Resume Analyzer</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("coach")}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-bold leading-none transition ${
                  activeTab === "coach"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <BrainCircuit className="h-4 w-4" />
                <span>AI Interview Coach</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("jobs")}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-bold leading-none transition ${
                  activeTab === "jobs"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Compass className="h-4 w-4" />
                <span>Job Matching Matrix</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("gap")}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-bold leading-none transition ${
                  activeTab === "gap"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Layers className="h-4 w-4" />
                <span>Skill Gap Analysis</span>
              </button>
            </div>
          </div>

          {/* Active Workspace area */}
          <div className="bg-white rounded-3xl border border-slate-200/85 p-6 sm:p-8 shadow-xl shadow-slate-200/30">
            
            {/* TABS 1: ATS RESUME ANALYZER */}
            {activeTab === "ats" && (
              <div className="space-y-8 animate-fade-in">
                <div className="space-y-2">
                  <h2 className="font-display text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                    <FileText className="h-6 w-6 text-indigo-600" />
                    <span>ATS Resume Analyzer Audit</span>
                  </h2>
                  <p className="text-slate-500 text-sm">
                    Contrast your resume text profile against target job structures using Gemini LLM compliance checks.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                  {/* Left Parameter Panel */}
                  <form onSubmit={handleAtsSubmit} className="space-y-5 lg:col-span-5">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                        Target Expected Role / Title
                      </label>
                      <input
                        type="text"
                        value={expectedRole}
                        onChange={(e) => setExpectedRole(e.target.value)}
                        placeholder="e.g. Back-end Software Engineer"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-sm font-medium outline-none focus:bg-white focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider">
                          Paste Your Full Resume Text
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setResumeText(`ALEXANDER STERLING
alex.sterling@example.com | (555) 019-2831
B.S. Computer Science - Stanford University

EXPERIENCE:
Front-end Web Intern at DevSprint Corp
- Built web pages utilizing HTML, CSS, JavaScript, and React.
- Improved site optimization metrics by 10%.
- Interacted with designers to deploy PRD blueprints.

SKILLS:
React, TypeScript, CSS, Node.js, SQL, basic LLMs`);
                            setExpectedRole("Senior AI Engineer");
                            setCustomJobDesc(`We need a Senior AI Engineer leading the LLM features, custom RAG integrations, and TypeScript workflows. Comfort with vector storage, Python, prompt engineering, and cloud platforms.`);
                          }}
                          className="text-xs font-bold text-indigo-700 hover:underline hover:text-indigo-900"
                        >
                          Fill Sample Resume text
                        </button>
                      </div>
                      <textarea
                        rows={8}
                        required
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        placeholder="Paste plain text content from your PDF or docx here..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 px-3.5 text-xs font-mono outline-none focus:bg-white focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-1.5">
                        Target Job Description Requirements (Optional)
                      </label>
                      <textarea
                        rows={4}
                        value={customJobDesc}
                        onChange={(e) => setCustomJobDesc(e.target.value)}
                        placeholder="Paste the target company job description to get specialized, custom match assessments..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 px-3.5 text-xs font-sans outline-none focus:bg-white focus:border-indigo-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={atsLoading}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg hover:bg-indigo-700 hover:shadow-indigo-150 transition"
                    >
                      {atsLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Gemini ATS Parser running...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 text-indigo-200" />
                          <span>Run Gemini ATS Resume Audit</span>
                        </>
                      )}
                    </button>

                    {atsError && (
                      <div className="rounded-xl bg-red-50 p-4 border border-red-100 text-xs text-red-600 flex flex-col gap-2">
                        <span className="font-bold">Audit execution error:</span>
                        <span>{atsError}</span>
                      </div>
                    )}
                  </form>

                  {/* Right Audit Results Panel */}
                  <div className="lg:col-span-7">
                    <AnimatePresence mode="wait">
                      {atsResult ? (
                        <motion.div 
                          key="results"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="space-y-6"
                        >
                          {/* Top Score banner */}
                          <div className="bg-indigo-50 border border-indigo-100/50 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                            <div className="space-y-1">
                              <span className="text-xs font-semibold uppercase tracking-widest text-indigo-600 font-mono">ATS Compliance Rating</span>
                              <h3 className="font-display text-xl font-bold text-slate-900">
                                Target Role: <span className="text-indigo-700">{atsResult.matchedRole}</span>
                              </h3>
                              <p className="text-xs text-slate-500">{atsResult.summary}</p>
                            </div>
                            <div className="flex flex-col items-center justify-center shrink-0">
                              <div className="relative flex items-center justify-center h-24 w-24 rounded-full border-4 border-indigo-600 bg-white font-display text-3xl font-extrabold text-indigo-700 shadow-inner">
                                {atsResult.score}
                                <span className="absolute bottom-1.5 text-[10px] font-mono tracking-widest uppercase opacity-70">Index</span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {/* Strengths */}
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100/80 space-y-3">
                              <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                <span>Core Strengths Evaluated</span>
                              </h4>
                              <ul className="space-y-2 text-xs font-medium text-slate-600 list-disc list-inside">
                                {atsResult.strengths?.map((str, idx) => (
                                  <li key={idx}>{str}</li>
                                ))}
                              </ul>
                            </div>

                            {/* Weaknesses */}
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100/80 space-y-3">
                              <h4 className="text-xs font-bold text-red-700 uppercase tracking-wider flex items-center gap-1.5">
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                <span>Design/Gaps Identified</span>
                              </h4>
                              <ul className="space-y-2 text-xs font-medium text-slate-600 list-disc list-inside">
                                {atsResult.weaknesses?.map((w, idx) => (
                                  <li key={idx}>{w}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Missing keywords */}
                          <div className="p-5 border border-slate-200/70 rounded-2xl space-y-3">
                            <h4 className="text-xs font-bold text-orange-700 uppercase tracking-wider">
                              Critical Missing Keywords / Competencies
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {atsResult.missingKeywords?.map((k, idx) => (
                                <span key={idx} className="rounded-lg bg-orange-50 border border-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700 font-mono">
                                  {k}
                                </span>
                              ))}
                              {(!atsResult.missingKeywords || atsResult.missingKeywords.length === 0) && (
                                <span className="text-xs text-slate-500">Perfect! No crucial keywords are flagged as missing.</span>
                              )}
                            </div>
                          </div>

                          {/* Formatting and presentation issues */}
                          <div className="p-5 border border-slate-200/70 rounded-2xl space-y-3">
                            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                              Visual or Structuring Revisions
                            </h4>
                            <ul className="space-y-2 text-xs font-medium text-slate-600">
                              {atsResult.formattingIssues?.map((f, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <span className="text-indigo-400 mt-1">•</span>
                                  <span>{f}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Actionable Improvements */}
                          <div className="bg-indigo-950/5 border border-indigo-950/10 p-5 rounded-2xl space-y-3 animate-pulse">
                            <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-widest flex items-center gap-1.5">
                              <Sparkles className="h-4 w-4 text-indigo-600" />
                              <span>Gemini Optimization Strategy</span>
                            </h4>
                            <ol className="space-y-2.5 text-xs font-semibold text-indigo-900 list-decimal list-inside">
                              {atsResult.improvements?.map((imp, idx) => (
                                <li key={idx} className="leading-relaxed">{imp}</li>
                              ))}
                            </ol>
                          </div>

                        </motion.div>
                      ) : (
                        <motion.div 
                          key="placeholder"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center bg-slate-50/50"
                        >
                          <FileText className="h-12 w-12 text-slate-300 mb-3 animate-pulse" />
                          <p className="text-base font-bold text-slate-800 font-display">No Audit Active</p>
                          <p className="text-slate-400 text-xs max-w-sm mt-1">
                            Complete the resume block to the left and click &quot;Run Gemini ATS Resume Audit&quot; to inspect semantic alignment.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            )}

            {/* TABS 2: INTERVIEW COACH */}
            {activeTab === "coach" && (
              <div className="space-y-6 animate-fade-in flex flex-col h-[520px]">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
                  <div className="space-y-1">
                    <h2 className="font-display text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                      <BrainCircuit className="h-6 w-6 text-indigo-600 animate-pulse" />
                      <span>AI Interview Coach Simulator</span>
                    </h2>
                    <p className="text-slate-500 text-xs">
                      Participate in behavioral and technical interviews with continuous assessment feedback.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleStartInterview(regTargetTitle || "Software Engineer")}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                    title="Restart standard mock interview session"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Reset Interview</span>
                  </button>
                </div>

                {coachError && (
                  <div className="rounded-xl bg-red-50 p-4 border border-red-100 text-xs text-red-600 shrink-0">
                    {coachError}
                  </div>
                )}

                {/* Messages stream area */}
                <div className="flex-grow overflow-y-auto border border-slate-100 rounded-2xl bg-slate-50/50 p-4 space-y-4 no-scrollbar">
                  {coachMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[85%] space-y-1 ${
                        msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                      }`}
                    >
                      {/* Feedback box */}
                      {msg.role === "model" && msg.feedback && (
                        <div className="text-xxs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-lg px-2.5 py-1 mb-1 shadow-sm flex items-center gap-1 animate-fade-in max-w-full">
                          <ThumbsUp className="h-3 w-3 shrink-0 text-emerald-600" />
                          <span><strong>AI Evaluator:</strong> {msg.feedback}</span>
                        </div>
                      )}

                      <div
                        className={`rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm font-semibold ${
                          msg.role === "user"
                            ? "bg-indigo-600 text-white rounded-tr-none"
                            : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-none"
                        }`}
                      >
                        {msg.text}
                      </div>

                      <span className="text-[10px] font-mono text-gray-400 px-1">{msg.timestamp}</span>
                    </div>
                  ))}

                  {coachLoading && (
                    <div className="flex items-center gap-2 mr-auto bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-400 shadow-sm leading-none shrink-0 animate-pulse">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" />
                      <span>AI interview coach evaluating metrics...</span>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Chat User response controller */}
                <form onSubmit={handleSendInterviewMessage} className="flex gap-3 shrink-0">
                  <input
                    type="text"
                    required
                    value={userAnswer}
                    disabled={coachLoading}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Describe your STAR answer strategy clearly here..."
                    className="flex-grow rounded-xl border border-slate-200 py-3 px-4 text-xs font-semibold outline-none focus:border-indigo-500 font-sans"
                  />
                  <button
                    type="submit"
                    disabled={coachLoading || !userAnswer.trim()}
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white p-3 shadow-lg shadow-indigo-100 shrink-0 flex items-center justify-center transition disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            )}

            {/* TABS 3: JOB MATCHING */}
            {activeTab === "jobs" && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-1">
                  <h2 className="font-display text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                    <Compass className="h-6 w-6 text-indigo-600" />
                    <span>Algorithmic Job Matching Matrix</span>
                  </h2>
                  <p className="text-slate-500 text-sm">
                    Review active listings inside the portal matching your target tech components and primary skills index.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {AVAILABLE_JOBS.map((job) => {
                    // Quick mock match score setup based on skills math
                    const studentSkills = regSkills.toLowerCase().split(",").map(s => s.trim());
                    const matchedScore = Math.min(
                      100, 
                      Math.max(
                        40, 
                        Math.round((job.skills.filter(s => studentSkills.some(ss => ss.includes(s.toLowerCase()) || s.toLowerCase().includes(ss))).length / job.skills.length) * 100)
                      )
                    );

                    return (
                      <div 
                        key={job.id} 
                        className="rounded-2xl border border-slate-200/80 bg-white p-5 flex flex-col justify-between hover:border-indigo-300 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
                      >
                        <div className="absolute top-0 right-0 p-2 text-xxs font-mono bg-indigo-50 text-indigo-700 font-bold rounded-bl-xl leading-none">
                          {matchedScore}% Match
                        </div>

                        <div className="space-y-4">
                          <div>
                            <span className="text-[10px] font-mono uppercase font-bold text-slate-400">{job.company}</span>
                            <h3 className="font-display text-lg font-bold text-slate-900 leading-tight mt-0.5">{job.title}</h3>
                            <div className="flex items-center gap-2 text-xxs text-slate-500 mt-1.5 font-medium">
                              <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3 text-slate-400" /> {job.location}</span>
                              <span className="text-slate-300">|</span>
                              <span className="flex items-center gap-0.5"><DollarSign className="h-3 w-3 text-slate-400" /> {job.salary}</span>
                            </div>
                          </div>

                          <p className="text-slate-600 text-xs leading-relaxed leading-tight">{job.description}</p>

                          <div>
                            <h4 className="text-xxs font-bold text-slate-700 uppercase tracking-widest mb-1">Target Skill Stack</h4>
                            <div className="flex flex-wrap gap-1">
                              {job.skills.map((sk, idx) => (
                                <span key={idx} className="rounded px-1.5 py-0.5 text-[10px] font-mono leading-none bg-slate-50 border border-slate-100 text-slate-500">
                                  {sk}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              alert(`Successfully Applied! Simulated Resume package with optimized skill coordinates has been sent directly to recruitment lead pipeline for review!`);
                            }}
                            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-4 shadow-sm"
                          >
                            Easy Apply
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab("ats");
                              setExpectedRole(job.title);
                              setCustomJobDesc(`Expected listing requirements:\n${job.skills.join(", ")}\nRole objective: ${job.description}`);
                            }}
                            className="text-xs font-bold text-indigo-700 hover:underline"
                          >
                            Compare in ATS Analyzer
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TABS 4: SKILL GAP MATRIX */}
            {activeTab === "gap" && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h2 className="font-display text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                    <Award className="h-6 w-6 text-indigo-600" />
                    <span>Skill Gap Assessment Matrix</span>
                  </h2>
                  <p className="text-slate-500 text-sm">
                    Detect which modern frameworks and enterprise workflows you need to learn to maximize high-performance matchmaking suitability.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Left Assessment Map */}
                  <div className="p-6 border border-slate-200/80 rounded-2xl bg-slate-50/50 space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 leading-tight">Match alignment for <span className="text-indigo-600 font-extrabold">{regTargetTitle}</span></h3>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center text-xs font-bold mb-1">
                          <span className="text-slate-700">TypeScript & Core JS structures</span>
                          <span className="text-indigo-700">85% (Strong)</span>
                        </div>
                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600" style={{ width: "85%" }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center text-xs font-bold mb-1">
                          <span className="text-slate-700">React Core Ecosystem (Components, Custom Hooks)</span>
                          <span className="text-indigo-700">80% (Advanced)</span>
                        </div>
                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600" style={{ width: "80%" }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center text-xs font-bold mb-1">
                          <span className="text-slate-700">Large Language Models (Gemini APIs, Prompt Designs)</span>
                          <span className="text-orange-700">35% (Gap Found)</span>
                        </div>
                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-500" style={{ width: "35%" }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center text-xs font-bold mb-1">
                          <span className="text-slate-700">Enterprise deployment (Docker, GCP, Vector Stores)</span>
                          <span className="text-red-700">15% (Critical Deficit)</span>
                        </div>
                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500" style={{ width: "15%" }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Recommendations */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Gemini Personalized Milestones</h3>
                    
                    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3.5 transform hover:-translate-y-0.5 transition-transform">
                      <span className="text-[10px] font-mono leading-none font-bold uppercase tracking-widest bg-red-50 border border-red-100 text-red-650 px-2 py-0.5 rounded">High Urgency</span>
                      <h4 className="text-xs font-bold text-slate-900 leading-none">Learn Google Cloud Integration + Docker basics</h4>
                      <p className="text-slate-500 text-[11px] leading-relaxed">Enterprise software recruiters search heavily for developers comfortable with container deployment sequences. Build tiny projects on Cloud Run.</p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3.5 transform hover:-translate-y-0.5 transition-transform">
                      <span className="text-[10px] font-mono leading-none font-bold uppercase tracking-widest bg-orange-50 border border-orange-100 text-orange-650 px-2 py-0.5 rounded">Medium Urgency</span>
                      <h4 className="text-xs font-bold text-slate-900 leading-none">Build a RAG system using @google/genai SDK</h4>
                      <p className="text-slate-500 text-[11px] leading-relaxed">Study semantic query strategies using embeddings vectors and model completions. Prepare custom system instructions inside your chat workspaces.</p>
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
