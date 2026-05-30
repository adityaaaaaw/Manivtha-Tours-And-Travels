'use client';

import React, { useState, useEffect } from 'react';
import { Newspaper, Terminal, Radio, ShieldCheck } from 'lucide-react';

export default function DashboardHeader() {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full bg-white/70 backdrop-blur-md border-b border-slate-200/80 px-6 py-4 sticky top-0 z-50 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Title Area */}
      <div className="flex items-center gap-3">
        <div className="bg-red-600 text-white p-2.5 rounded-xl shadow-lg shadow-red-200 flex items-center justify-center animate-pulse">
          <Newspaper className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            AI తెలుగు న్యూస్ అసిస్టెంట్
            <span className="text-xs font-semibold px-2 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded-full">
              PRO
            </span>
          </h1>
          <p className="text-xs font-medium text-slate-500 tracking-wider uppercase flex items-center gap-1.5 mt-0.5">
            <Terminal className="h-3 w-3 text-red-500" />
            Editorial Workspace AI • Namaste Telangana Suite Sim
          </p>
        </div>
      </div>

      {/* Stats/Status Counters */}
      <div className="flex flex-wrap items-center gap-3 md:gap-5">
        {/* Status indicator */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </div>
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Live Wire
          </span>
        </div>

        {/* Engine Name */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-red-50/50 rounded-xl border border-red-100/50 text-xs font-medium text-red-700">
          <Radio className="h-3.5 w-3.5 animate-pulse text-red-500" />
          <span>Gemini 1.5 Flash</span>
        </div>

        {/* System Online badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100 text-xs font-medium text-slate-600">
          <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
          <span>Secured</span>
        </div>

        {/* Ticking Clock */}
        <div className="bg-slate-900 text-slate-100 px-4 py-1.5 rounded-xl text-sm font-mono font-bold tracking-widest shadow-inner border border-slate-800 shadow-black/10 min-w-[100px] text-center">
          {time || '00:00:00'}
        </div>
      </div>
    </header>
  );
}
