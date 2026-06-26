/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { UserSession, UserRole } from "./types";
import { Navbar } from "./components/Navbar";
import { LandingPage } from "./components/LandingPage";
import { StudentZone } from "./components/StudentZone";
import { RecruiterZone } from "./components/RecruiterZone";
import { AdminZone } from "./components/AdminZone";
import { ShieldAlert, RefreshCw, Key, LogOut, ArrowLeft, Home, Layers } from "lucide-react";

export default function App() {
  // 1. Reactive Location Routing State
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handleLocationChange);
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, []);

  const navigate = (path: string) => {
    window.history.pushState(null, "", path);
    setCurrentPath(path);
  };

  // 2. Persistent User Session Management
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem("careerhub_session");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const loginUser = (session: UserSession | null) => {
    if (session) {
      localStorage.setItem("careerhub_session", JSON.stringify(session));
      setCurrentUser(session);
    } else {
      localStorage.removeItem("careerhub_session");
      setCurrentUser(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("careerhub_session");
    setCurrentUser(null);
    navigate("/");
  };

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("careerhub_darkmode");
    return saved === "true";
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const nextValue = !prev;
      localStorage.setItem("careerhub_darkmode", String(nextValue));
      return nextValue;
    });
  };

  // 3. SECURE ROLE ACCESS SHIELD RULES ENFORCEMENT
  const isStudentRoute = currentPath.startsWith("/student/dashboard");
  const isRecruiterRoute = currentPath.startsWith("/recruiter/dashboard");
  const isAdminRoute = currentPath.startsWith("/admin");

  const hasStudentClearance = currentUser?.role === "ROLE_STUDENT" || currentUser?.role === "ROLE_ADMIN";
  const hasRecruiterClearance = currentUser?.role === "ROLE_RECRUITER" || currentUser?.role === "ROLE_ADMIN";
  const hasAdminClearance = currentUser?.role === "ROLE_ADMIN";

  let isForbidden = false;
  let forbiddenRequiredRole = "";
  let currentActiveRole = currentUser?.role || "GUEST_VISITOR";

  if (isStudentRoute && !hasStudentClearance) {
    isForbidden = true;
    forbiddenRequiredRole = "ROLE_STUDENT";
  } else if (isRecruiterRoute && !hasRecruiterClearance) {
    isForbidden = true;
    forbiddenRequiredRole = "ROLE_RECRUITER";
  } else if (isAdminRoute && !hasAdminClearance) {
    isForbidden = true;
    forbiddenRequiredRole = "ROLE_ADMIN";
  }

  // Developer rapid-swap identity helpers from within the forbidden block itself
  const handleAuditorRoleSwap = (targetRole: UserRole) => {
    const session: UserSession = {
      email: `${targetRole.toLowerCase().split("_")[1]}@careerhub.ai`,
      name: `Security Evaluator (${targetRole.split("_")[1]})`,
      role: targetRole,
      token: `AUDIT_SWAP_ACTIVE_${targetRole}`,
      companyName: targetRole === "ROLE_RECRUITER" ? "Veridian Enterprises" : undefined
    };
    loginUser(session);
    alert(`Clearance elevated to ${targetRole}. Proceeding to dashboard!`);
  };

  return (
    <div className="font-sans antialiased text-slate-800 bg-slate-50 dark:bg-slate-950 dark:text-slate-100 min-h-screen flex flex-col justify-between transition-colors duration-350">
      
      {/* Universal navigation platform */}
      <Navbar 
        currentPath={currentPath} 
        navigate={navigate} 
        user={currentUser} 
        logout={logout} 
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      {/* Main viewport area */}
      <main className="flex-grow">
        {isForbidden ? (
          /* GLORIOUS, HIGHLY-POLISHED HTTP 403 SECURITIES CORNERSTONE CARD */
          <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-900 px-4 py-12 text-white font-mono">
            <div className="w-full max-w-lg rounded-3xl border border-red-900/50 bg-slate-950 p-8 shadow-2xl space-y-6 text-center animate-fade-in">
              
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 animate-pulse border border-red-500/20">
                  <ShieldAlert className="h-8 w-8" />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="font-display font-extrabold text-2xl text-red-500 tracking-tight leading-none">
                  HTTP 403 Forbidden
                </h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-none">
                  Unauthorized Access Blocked
                </p>
                <div className="py-2.5 px-4 rounded bg-slate-900 text-xs text-slate-300 leading-relaxed max-w-md mx-auto space-y-1 mt-4">
                  <div className="flex justify-between border-b border-slate-800/80 pb-1.5 mb-1.5 text-xxs font-semibold uppercase tracking-wider text-slate-550">
                    <span>Identity Status</span>
                    <span>Metrics</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Attempted URL:</span>
                    <strong className="text-white font-mono">{currentPath}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Required Role:</span>
                    <strong className="text-red-400 underline font-mono">{forbiddenRequiredRole}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Your Current Role:</span>
                    <strong className="text-amber-400 font-mono">{currentActiveRole}</strong>
                  </div>
                </div>
              </div>

              {/* Development Quick Role Escalator panel */}
              <div className="border border-slate-800 rounded-2xl p-4 bg-slate-900/40 text-left space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 leading-none">
                  <Layers className="h-4 w-4 text-emerald-500" />
                  <span>Interactive Security Testing Panel</span>
                </h3>
                <p className="text-xxs text-slate-500 leading-relaxed font-semibold">
                  Swap candidate roles dynamically below to bypass this 403 restriction in real-time during audit reviews:
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleAuditorRoleSwap("ROLE_STUDENT")}
                    className="rounded-lg bg-slate-800 hover:bg-slate-700 hover:text-white px-3 py-2 text-xxs font-bold text-left text-indigo-400 transition cursor-pointer"
                  >
                    Set ROLE_STUDENT
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAuditorRoleSwap("ROLE_RECRUITER")}
                    className="rounded-lg bg-slate-800 hover:bg-slate-700 hover:text-white px-3 py-2 text-xxs font-bold text-left text-emerald-450 transition cursor-pointer"
                  >
                    Set ROLE_RECRUITER
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAuditorRoleSwap("ROLE_ADMIN")}
                    className="rounded-lg bg-red-950/40 border border-red-900/30 hover:bg-red-900/25 px-3 py-2 text-xxs font-bold text-left text-red-400 transition cursor-span col-span-2 text-center"
                  >
                    Elevate to Super Operator (ROLE_ADMIN)
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-bold text-white transition flex items-center gap-1.5 leading-none"
                >
                  <Home className="h-3.5 w-3.5" />
                  <span>Return to Home</span>
                </button>
              </div>

            </div>
          </div>
        ) : (
          /* DYNAMIC VIEW ROUTER BOARD */
          <>
            {currentPath === "/" && (
              <LandingPage navigate={navigate} />
            )}

            {currentPath.startsWith("/student") && (
              <StudentZone 
                currentPath={currentPath} 
                navigate={navigate} 
                user={currentUser} 
                loginUser={loginUser} 
              />
            )}

            {currentPath.startsWith("/recruiter") && (
              <RecruiterZone 
                currentPath={currentPath} 
                navigate={navigate} 
                user={currentUser} 
                loginUser={loginUser} 
              />
            )}

            {currentPath.startsWith("/admin") && (
              <AdminZone 
                currentPath={currentPath} 
                navigate={navigate} 
                user={currentUser} 
                loginUser={loginUser} 
              />
            )}
          </>
        )}
      </main>

    </div>
  );
}

