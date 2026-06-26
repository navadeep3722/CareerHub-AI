import React from "react";
import { UserSession } from "../types";
import { Briefcase, Key, LogOut, ShieldAlert, Sparkles, User, Sun, Moon } from "lucide-react";

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
  user: UserSession | null;
  logout: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export function Navbar({ currentPath, navigate, user, logout, darkMode, toggleDarkMode }: NavbarProps) {
  // Determine if under student path or recruiter path
  const isStudentZone = currentPath.startsWith("/student");
  const isRecruiterZone = currentPath.startsWith("/recruiter");
  const isAdminZone = currentPath.startsWith("/admin");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200/80 bg-white/95 backdrop-blur-md transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo & Edition badge */}
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => navigate("/")} 
            className="flex items-center gap-2 font-display text-xl font-bold tracking-tight text-gray-950 dark:text-white transition hover:opacity-90"
          >
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-white ${
              isRecruiterZone 
                ? "bg-slate-900 shadow-emerald-100 shadow-md dark:bg-emerald-600" 
                : "bg-indigo-600 shadow-indigo-100 shadow-md"
            }`}>
              <Briefcase className="h-4 w-4" />
            </div>
            <span>CareerHub <span className={isRecruiterZone ? "text-emerald-600 dark:text-emerald-450" : "text-indigo-600 dark:text-indigo-400"}>AI</span></span>
          </button>

          {/* Portal Indicators */}
          {isStudentZone && (
            <span className="hidden rounded-full bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 sm:inline-block border border-indigo-100 dark:border-indigo-900 animate-pulse">
              Student Edition
            </span>
          )}
          {isRecruiterZone && (
            <span className="hidden rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-450 sm:inline-block border border-emerald-100 dark:border-emerald-950">
              Recruiter Enterprise
            </span>
          )}
          {isAdminZone && (
            <span className="hidden rounded-full bg-red-50 dark:bg-red-950/40 px-2.5 py-0.5 text-xs font-semibold text-red-600 dark:text-red-400 sm:inline-block border border-red-100 dark:border-red-900">
              Admin Terminal
            </span>
          )}
        </div>

        {/* Action Items */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
              currentPath === "/admin/dashboard"
                ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50"
                : "text-gray-500 border-gray-200 hover:bg-gray-50 dark:text-slate-400 dark:border-slate-800 dark:hover:bg-slate-800 dark:hover:text-white"
            }`}
            title="Test Role-Based 403 Security Controls by visiting /admin"
          >
            <ShieldAlert className="h-3.5 w-3.5 text-red-500" />
            <span>Test Admin Zone</span>
          </button>

          {/* Elegant Sun/Moon Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition-all duration-200 hover:bg-gray-50 hover:text-gray-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white cursor-pointer"
            title={darkMode ? "Switch to Light theme" : "Switch to Dark theme"}
          >
            {darkMode ? (
              <Sun className="h-4.5 w-4.5 text-amber-500 hover:scale-110 transition-transform" />
            ) : (
              <Moon className="h-4.5 w-4.5 text-indigo-500 hover:scale-110 transition-transform" />
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-white font-semibold font-display text-sm ${
                  user.role === 'ROLE_RECRUITER' 
                    ? "bg-emerald-600" 
                    : user.role === 'ROLE_ADMIN' 
                      ? "bg-red-600" 
                      : "bg-indigo-600"
                }`}>
                  {user.name.charAt(0)}
                </div>
                <div className="hidden flex-col text-left sm:flex">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{user.name}</span>
                  <span className="text-xxs font-mono text-gray-400 dark:text-slate-450 leading-none mt-0.5">{user.role}</span>
                </div>
              </div>

              <div className="h-4 w-px bg-gray-200 dark:bg-slate-830" />

              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate("/student/login")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  isStudentZone 
                    ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:hover:bg-indigo-900/40" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => navigate("/recruiter/login")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  isRecruiterZone 
                    ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-900/40" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
                }`}
              >
                Recruiter
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
