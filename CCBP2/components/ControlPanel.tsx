'use client';

import React from 'react';
import { SlidersHorizontal, Sparkles, Scale, BookOpen, Flame, Compass, MessageCircle } from 'lucide-react';

interface ControlPanelProps {
  length: 'Short' | 'Medium' | 'Detailed';
  setLength: (len: 'Short' | 'Medium' | 'Detailed') => void;
  tone: 'Professional' | 'Simple' | 'Social Media' | 'Breaking News';
  setTone: (tone: 'Professional' | 'Simple' | 'Social Media' | 'Breaking News') => void;
  onSubmit: () => void;
  isLoading: boolean;
  isDisabled: boolean;
}

export default function ControlPanel({
  length,
  setLength,
  tone,
  setTone,
  onSubmit,
  isLoading,
  isDisabled,
}: ControlPanelProps) {
  const lengths = [
    { id: 'Short', label: 'చిన్నది (Short)', desc: 'Bullet facts & brief outline' },
    { id: 'Medium', label: 'మధ్యస్థం (Medium)', desc: 'Standard editorial layout' },
    { id: 'Detailed', label: 'వివరణాత్మక (Detailed)', desc: 'Comprehensive full-length outline' },
  ] as const;

  const tones = [
    {
      id: 'Professional',
      label: 'వ్యాస శైలి (Professional)',
      desc: 'Formal editorial journalistic tone',
      icon: Compass,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
      activeColor: 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/10',
    },
    {
      id: 'Simple',
      label: 'సరళమైనది (Simple)',
      desc: 'Clear, easy Telugu for general readers',
      icon: BookOpen,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      activeColor: 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/10',
    },
    {
      id: 'Social Media',
      label: 'సోషల్ మీడియా (Social)',
      desc: 'Highly shareable, emoji-rich style',
      icon: MessageCircle,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
      activeColor: 'border-purple-500 bg-purple-50/50 ring-2 ring-purple-500/10',
    },
    {
      id: 'Breaking News',
      label: 'బ్రేకింగ్ న్యూస్ (Breaking)',
      desc: 'Urgent, high-impact alert styling',
      icon: Flame,
      color: 'text-red-600 bg-red-50 border-red-100',
      activeColor: 'border-red-500 bg-red-50/50 ring-2 ring-red-500/10',
    },
  ] as const;

  return (
    <div className="w-full bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-xl shadow-slate-100 flex flex-col gap-6">
      {/* Title */}
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <div className="p-1.5 bg-red-50 rounded-lg text-red-600">
          <SlidersHorizontal className="h-4.5 w-4.5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            ఏఐ నియంత్రణ ప్యానెల్ (AI Control Panel)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Customize AI outputs, size parameters, and editorial tone</p>
        </div>
      </div>

      {/* 1. Summary Length Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
          <Scale className="h-3.5 w-3.5 text-slate-400" />
          సారాంశం నిడివి (Summary Length):
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {lengths.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={isLoading}
              onClick={() => setLength(item.id)}
              className={`flex flex-col items-start px-4 py-2.5 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                length === item.id
                  ? 'border-red-500 bg-red-50/40 ring-2 ring-red-500/15'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
              } disabled:opacity-50`}
            >
              <span className={`text-xs font-bold ${length === item.id ? 'text-red-700' : 'text-slate-700'}`}>
                {item.label}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 font-medium leading-tight">
                {item.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Tone Selector Grid */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5 text-slate-400" />
          భాషావైఖరి / టోన్ (Tone Selector):
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {tones.map((item) => {
            const Icon = item.icon;
            const isSelected = tone === item.id;
            return (
              <button
                key={item.id}
                type="button"
                disabled={isLoading}
                onClick={() => setTone(item.id)}
                className={`flex items-start gap-3 p-3 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                  isSelected ? item.activeColor : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                } disabled:opacity-50`}
              >
                <div className={`p-2 rounded-lg border shrink-0 ${isSelected ? item.color : 'text-slate-400 bg-slate-50 border-slate-100'}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="flex flex-col">
                  <span className={`text-xs font-bold ${isSelected ? 'text-slate-800' : 'text-slate-700'}`}>
                    {item.label}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 font-medium leading-snug">
                    {item.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. CTA Action Button */}
      <button
        type="button"
        disabled={isLoading || isDisabled}
        onClick={onSubmit}
        className={`w-full relative overflow-hidden bg-red-600 hover:bg-red-700 text-white rounded-xl py-3.5 px-6 font-bold text-sm tracking-wider uppercase transition-all duration-300 shadow-lg shadow-red-200 hover:shadow-red-300 hover:shadow-xl active:scale-[0.99] flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none`}
      >
        <Sparkles className="h-4.5 w-4.5 animate-pulse text-white/90 group-hover:rotate-12 transition-transform" />
        <span>వార్తా విశ్లేషణ ప్రారంభించు (Generate AI Assets)</span>
      </button>
    </div>
  );
}
