"use client";

import { useToastStore } from "@/store/toastStore";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, AlertOctagon, Info, AlertTriangle, X } from "lucide-react";

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    error: <AlertOctagon className="w-5 h-5 text-rose-400" />,
    info: <Info className="w-5 h-5 text-sky-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
  };

  const borders = {
    success: "border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]",
    error: "border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.1)]",
    info: "border-sky-500/30 shadow-[0_0_15px_rgba(56,189,248,0.1)]",
    warning: "border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]",
  };

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border glass-card ${borders[toast.type]}`}
          >
            <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
            <div className="flex-grow text-sm font-medium text-slate-200">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-slate-400 hover:text-slate-200 transition-colors p-0.5 rounded-lg hover:bg-slate-800/40"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
