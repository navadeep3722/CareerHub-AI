import React, { useState, useEffect } from "react";
import { UserSession } from "../types";
import { ShieldCheck, ShieldAlert, Terminal, RefreshCw, Layers, Radio, User, Cpu } from "lucide-react";

interface AdminZoneProps {
  currentPath: string;
  navigate: (path: string) => void;
  user: UserSession | null;
  loginUser: (session: UserSession | null) => void;
}

interface LogEntry {
  time: string;
  message: string;
}

export function AdminZone({ currentPath, navigate, user, loginUser }: AdminZoneProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorWord, setErrorWord] = useState("");

  const loadAdminLogs = async () => {
    setLoading(true);
    setErrorWord("");
    try {
      const response = await fetch("/api/admin/system-logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user?.token || ""}:${user?.role || ""}`
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("HTTP 403: Forbidden - Admin clearance required to pull system-logs API stream.");
        }
        throw new Error("Failed to contact system endpoints");
      }

      const data = await response.json();
      setLogs(data.logs || []);
    } catch (err: any) {
      console.error(err);
      setErrorWord(err.message || "An error occurred pulling logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "ROLE_ADMIN") {
      loadAdminLogs();
    }
  }, [user]);

  // Handle mock role toggles (impersonation controls)
  const impersonateRole = (role: 'NONE' | 'ROLE_STUDENT' | 'ROLE_RECRUITER' | 'ROLE_ADMIN') => {
    if (role === 'NONE') {
      loginUser(null);
      alert("Role cleared. You are now general unauthenticated visitor. Try visiting /student/dashboard or /recruiter/dashboard to trigger the HTTP 403 Block!");
    } else {
      loginUser({
        email: `${role.toLowerCase().split("_")[1]}@careerhub.ai`,
        name: `Mock ${role.split("_")[1].charAt(0).toUpperCase() + role.split("_")[1].slice(1)}`,
        role: role,
        token: `ADMIN_OVERRIDE_TOKEN_${role}`,
        companyName: role === 'ROLE_RECRUITER' ? 'Acme Impersonators Ltd' : undefined
      });
      alert(`Identity swapped! You are now logged in with role: ${role}. Try accessing dashboards now!`);
    }
  };

  // If not admin, we display the beautiful HTTP 403 Access Denied block UI itself!
  const isUnauthorized = !user || user.role !== "ROLE_ADMIN";

  if (isUnauthorized) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-900 px-4 py-12 text-white font-mono relative overflow-hidden">
        {/* Abstract warning background element */}
        <div className="absolute inset-0 bg-red-950/10 -z-10" />
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-red-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-indigo-500/5 blur-3xl" />

        <div className="w-full max-w-lg rounded-3xl border border-red-900/50 bg-slate-950 p-8 shadow-2xl space-y-6 text-center animate-fade-in relative z-10">
          
          <div className="flex justify-center shrink-0">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 animate-pulse border border-red-500/20">
              <ShieldAlert className="h-8 w-8" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="font-display font-extrabold text-2xl text-red-500 tracking-tight select-none">
              HTTP 403 Forbidden
            </h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-none">
              Unauthorized Area - Access Restricted
            </p>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto leading-relaxed mt-2.5">
              Your active credentials do not have the required role hierarchy clearances (<code className="text-red-400">ROLE_ADMIN</code>) to view the administration terminal at <code className="text-slate-300">/admin/dashboard</code>.
            </p>
          </div>

          {/* Prompt Impersonator tool directly inside the 403 view! This is amazingly helpful for testing */}
          <div className="border border-slate-800 rounded-2xl p-5 bg-slate-900/60 text-left space-y-4">
            <h3 className="text-xs font-bold text-slate-350 uppercase tracking-wider flex items-center gap-1.5 leading-none">
              <Layers className="h-4 w-4 text-emerald-500" />
              <span>Developer Identity Impersonator</span>
            </h3>
            <p className="text-xxs text-slate-500 leading-normal">
              Swap user credentials below to test structural boundaries in real time without manual re-registration:
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => impersonateRole('ROLE_STUDENT')}
                className="rounded-lg bg-slate-800 hover:bg-slate-700 hover:text-white px-3 py-2 text-xxs font-bold text-left transition text-indigo-400 cursor-pointer"
              >
                Student Key
              </button>

              <button
                type="button"
                onClick={() => impersonateRole('ROLE_RECRUITER')}
                className="rounded-lg bg-slate-800 hover:bg-slate-700 hover:text-white px-3 py-2 text-xxs font-bold text-left transition text-emerald-400 cursor-pointer"
              >
                Recruiter Key
              </button>

              <button
                type="button"
                onClick={() => impersonateRole('ROLE_ADMIN')}
                className="rounded-lg bg-red-950/40 border border-red-900/20 hover:bg-red-900/20 px-3 py-2 text-xxs font-bold text-left transition text-red-400 cursor-pointer col-span-2"
              >
                Impersonate ROLE_ADMIN (Elevate Clearance)
              </button>
            </div>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-bold text-white transition leading-none shrink-0"
            >
              Back to Landing Page
            </button>
          </div>

        </div>
      </div>
    );
  }

  // If logged in as ADMIN
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-300 font-mono pb-16">
      <div className="absolute inset-0 bg-slate-900/10 -z-10" />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 text-left">
        
        {/* Header Admin */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <Terminal className="h-8 w-8 text-red-500 animate-pulse shrink-0" />
              <span>Admin Terminal Workspace</span>
            </h1>
            <p className="text-slate-500 text-xs font-bold">
              Secure administrative credentials: <span className="text-red-400 font-mono">{user.name}</span> • ROLE_ADMIN Active
            </p>
          </div>

          {/* Quick Clear Override control */}
          <button
            type="button"
            onClick={() => impersonateRole("NONE")}
            className="rounded-xl border border-dashed border-red-900/60 bg-red-950/20 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-950/50"
          >
            Clear Authentication / Lock Areas
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          
          {/* Diagnostic Stats panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5 leading-none">
                <Cpu className="h-4 w-4 text-red-400" />
                <span>System status checks</span>
              </h3>

              <div className="space-y-3.5 text-xs text-slate-400">
                <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span>Port ingress bind:</span>
                  <span className="font-bold text-white">0.0.0.0:3000</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span>TLS validation:</span>
                  <span className="font-bold text-emerald-500 flex items-center gap-1"><Radio className="h-3 w-3 animate-ping" /> SECURE</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span>Semantic parser buffer:</span>
                  <span className="font-bold text-white">Active</span>
                </div>
              </div>
            </div>

            {/* Impersonator utility */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5 leading-none animate-pulse">
                <Layers className="h-4 w-4 text-emerald-500" />
                <span>Quick Role Swapper</span>
              </h3>
              <p className="text-xxs text-slate-500 leading-normal">
                Easily cycle credentials during testing to verify 403 access control policies on standard directories:
              </p>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => impersonateRole('ROLE_STUDENT')}
                  className="w-full text-center rounded-lg bg-slate-950 p-2.5 text-xs font-bold text-indigo-400 border border-slate-800 hover:border-indigo-900 transition cursor-pointer"
                >
                  Become Student (ROLE_STUDENT)
                </button>
                <button
                  type="button"
                  onClick={() => impersonateRole('ROLE_RECRUITER')}
                  className="w-full text-center rounded-lg bg-slate-950 p-2.5 text-xs font-bold text-emerald-450 border border-slate-800 hover:border-emerald-900 transition cursor-pointer"
                >
                  Become Recruiter (ROLE_RECRUITER)
                </button>
              </div>
            </div>
          </div>

          {/* Live system logs streamed via API */}
          <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 font-mono shadow-inner h-[400px] flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-slate-900 shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5 animate-pulse">
                <Radio className="h-3.5 w-3.5 text-red-500" />
                <span>Live diagnostics stream</span>
              </span>
              <button
                type="button"
                onClick={loadAdminLogs}
                disabled={loading}
                className="text-xxs font-bold text-red-400 hover:underline flex items-center gap-1"
              >
                <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
                <span>Refresh Log</span>
              </button>
            </div>

            <div className="flex-grow overflow-y-auto font-mono text-[11px] leading-relaxed space-y-2 text-slate-400 no-scrollbar pr-2 mt-2">
              {logs.map((log, idx) => (
                <div key={idx} className="flex gap-2 p-1.5 rounded hover:bg-slate-900">
                  <span className="text-slate-600 font-semibold shrink-0">[{log.time}]</span>
                  <span className="text-slate-300 font-medium">{log.message}</span>
                </div>
              ))}

              {logs.length === 0 && !loading && (
                <div className="text-center p-8 text-slate-650">No logs generated yet. Click refresh to query!</div>
              )}

              {loading && (
                <div className="text-center p-4 text-red-400">Pinging log stream from Express server...</div>
              )}

              {errorWord && (
                <div className="p-3 bg-red-950/20 border border-red-900/50 rounded-lg text-red-400">
                  {errorWord}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
