"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, ShieldCheck, Compass, Sparkles, AlertCircle, Terminal } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, login, signup, bypassLogin, error, clearError, initializeAuth } = useAuthStore();
  const { addToast } = useToastStore();

  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Initialize auth listener
  useEffect(() => {
    const unsub = initializeAuth();
    return () => unsub();
  }, [initializeAuth]);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!email || !password) {
      addToast("Please fill in all credentials.", "warning");
      return;
    }

    setFormLoading(true);
    try {
      if (isLoginTab) {
        await login(email, password);
        addToast(`Welcome back to Manivtha Travels, operations!`, "success");
      } else {
        if (!name) {
          addToast("Please provide your full name.", "warning");
          setFormLoading(false);
          return;
        }
        // Administrative signup protection code check
        if (adminCode !== "MANIVTHA2026") {
          addToast("Invalid administrative protection key.", "error");
          setFormLoading(false);
          return;
        }
        await signup(email, password, name);
        addToast("Administrative account successfully generated!", "success");
      }
      router.push("/dashboard");
    } catch (err: any) {
      addToast(err.message || "Authentication attempt failed.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleBypass = () => {
    bypassLogin();
    addToast("Console accessed in Demo Administrator mode.", "info");
    router.push("/dashboard");
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#020617] text-slate-100 select-none">
        <Compass className="w-10 h-10 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#020617] relative px-4 overflow-hidden py-10 select-none">
      {/* Background Decorative Rings */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-lg z-10">
        {/* Brand header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="p-4 rounded-3xl bg-gradient-to-tr from-indigo-600 to-cyan-500 shadow-[0_0_30px_rgba(99,102,241,0.4)] mb-4"
          >
            <Compass className="w-10 h-10 text-white animate-spin-slow" />
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
              Manivtha Tours & Travels
            </h1>
            <p className="mt-1 text-sm text-cyan-400 font-semibold tracking-wider uppercase">
              Fleet & Calendar Management
            </p>
          </motion.div>
        </div>

        {/* Portal card */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="border glass-card rounded-3xl overflow-hidden shadow-2xl relative"
        >
          {/* Tab Selector */}
          <div className="flex border-b border-slate-800/60 bg-slate-950/20">
            <button
              onClick={() => { setIsLoginTab(true); clearError(); }}
              className={`flex-1 py-4 text-center text-sm font-semibold transition-colors relative ${
                isLoginTab ? "text-indigo-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Sign In
              {isLoginTab && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 inset-x-0 h-0.5 bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                />
              )}
            </button>
            <button
              onClick={() => { setIsLoginTab(false); clearError(); }}
              className={`flex-1 py-4 text-center text-sm font-semibold transition-colors relative ${
                !isLoginTab ? "text-indigo-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Register Admin
              {!isLoginTab && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 inset-x-0 h-0.5 bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                />
              )}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
            {error && (
              <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-950/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!isLoginTab && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800/80 bg-slate-950/40 text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-100"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@manivthatravels.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800/80 bg-slate-950/40 text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-100"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800/80 bg-slate-950/40 text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-100"
                />
              </div>
            </div>

            {!isLoginTab && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    Administrative Code
                  </label>
                  <span className="text-[10px] text-cyan-400 font-bold bg-cyan-950/40 border border-cyan-800/50 px-2 py-0.5 rounded">
                    Code: MANIVTHA2026
                  </span>
                </div>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    placeholder="Enter security key to register"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800/80 bg-slate-950/40 text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-100"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={formLoading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm shadow-[0_4px_20px_rgba(99,102,241,0.25)] transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {formLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-indigo-200" />
                  <span>{isLoginTab ? "Access Admin Console" : "Establish Admin Profile"}</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Mode Bypass */}
          <div className="p-6 border-t border-slate-800/60 bg-slate-950/40 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-3">
              <Terminal className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
                Evaluation Center
              </span>
            </div>
            <button
              onClick={handleBypass}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-800 hover:border-indigo-500/50 bg-slate-950/50 hover:bg-indigo-950/15 text-indigo-300 hover:text-indigo-200 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-inner"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Instant Guest Bypass (Pre-configured Data)</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
