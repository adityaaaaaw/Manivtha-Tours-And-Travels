'use client';

import React, { useState, useEffect } from 'react';
import { Terminal, Cpu, Loader2, CheckCircle2 } from 'lucide-react';

interface ProcessingStateProps {
  isLoading: boolean;
}

export default function ProcessingState({ isLoading }: ProcessingStateProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { label: 'వార్తా కథన విశ్లేషణ ప్రారంభమైంది (Initializing wire analysis...)', status: 'active' },
    { label: 'తెలుగు వాక్యాల సంశ్లేషణ జరుగుతోంది (Analyzing Telugu vocabulary & syntax...)', status: 'pending' },
    { label: 'ముఖ్యాంశాలు & శీర్షికలను సృష్టిస్తోంది (Generating key highlights & headlines...)', status: 'pending' },
    { label: 'వాట్సాప్ & సోషల్ మీడియా కంటెంట్ రూపకల్పన (Structuring social drafts & emojis...)', status: 'pending' },
    { label: 'చివరి సవరణలు & శుద్ధి పనులు (Polishing final editorial assets...)', status: 'pending' },
  ];

  useEffect(() => {
    if (!isLoading) {
      setCurrentStep(0);
      return;
    }

    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2800); // Transitions steps every 2.8s to give a realistic pacing feel

    return () => clearInterval(timer);
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* 1. Terminal Console Loader */}
      <div className="w-full bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl shadow-slate-950/20">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2 text-red-500">
            <Terminal className="h-4 w-4" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest">
              Newsroom AI Engine v1.5
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping"></span>
            <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
            <span className="text-[10px] font-mono text-slate-500">RUNNING</span>
          </div>
        </div>

        {/* Dynamic Log Entries */}
        <div className="flex flex-col gap-3 font-mono text-xs text-slate-300">
          {steps.map((step, idx) => {
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep;

            return (
              <div
                key={idx}
                className={`flex items-start gap-2.5 transition-all duration-300 ${
                  isActive
                    ? 'text-white translate-x-1 font-semibold'
                    : isCompleted
                    ? 'text-emerald-500/80'
                    : 'text-slate-600'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : isActive ? (
                  <Loader2 className="h-4 w-4 text-red-500 animate-spin shrink-0 mt-0.5" />
                ) : (
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-700 shrink-0 mt-2 ml-1.5" />
                )}
                <div className="flex flex-col">
                  <span>{step.label}</span>
                  {isActive && (
                    <span className="text-[10px] text-red-400 mt-0.5 animate-pulse">
                      &gt; Computing LLM vectors and contextual weights...
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Responsive Shimmer Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Shimmer Card 1 */}
        <div className="bg-white/60 border border-slate-200/50 backdrop-blur-sm rounded-2xl p-5 flex flex-col gap-4 animate-pulse">
          <div className="h-4.5 bg-slate-200 rounded-lg w-1/3"></div>
          <div className="h-3.5 bg-slate-200 rounded-lg w-full"></div>
          <div className="h-3.5 bg-slate-200 rounded-lg w-5/6"></div>
          <div className="h-3.5 bg-slate-200 rounded-lg w-4/5"></div>
          <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
            <div className="h-8 bg-slate-200 rounded-xl w-20"></div>
            <div className="h-8 bg-slate-200 rounded-xl w-24"></div>
          </div>
        </div>

        {/* Shimmer Card 2 */}
        <div className="bg-white/60 border border-slate-200/50 backdrop-blur-sm rounded-2xl p-5 flex flex-col gap-4 animate-pulse">
          <div className="h-4.5 bg-slate-200 rounded-lg w-1/4"></div>
          <div className="flex flex-col gap-2">
            <div className="h-3 bg-slate-200 rounded-lg w-full"></div>
            <div className="h-3 bg-slate-200 rounded-lg w-full"></div>
            <div className="h-3 bg-slate-200 rounded-lg w-11/12"></div>
            <div className="h-3 bg-slate-200 rounded-lg w-5/6"></div>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
            <div className="h-8 bg-slate-200 rounded-xl w-20"></div>
            <div className="h-8 bg-slate-200 rounded-xl w-24"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
