'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, Copy, Check, Download, FileDown } from 'lucide-react';

interface OutputCardProps {
  title: string;
  englishLabel: string;
  content: string | string[];
  icon: LucideIcon;
  downloadFileName: string;
}

export default function OutputCard({
  title,
  englishLabel,
  content,
  icon: Icon,
  downloadFileName,
}: OutputCardProps) {
  const [copied, setCopied] = useState(false);

  const getFullTextContent = (): string => {
    if (Array.isArray(content)) {
      return content.map((item, idx) => `${idx + 1}. ${item}`).join('\n');
    }
    return content;
  };

  const handleCopy = async () => {
    const text = getFullTextContent();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleDownload = () => {
    const text = getFullTextContent();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${downloadFileName}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-xl shadow-slate-100 flex flex-col gap-4 group hover:border-red-200 hover:shadow-2xl hover:shadow-red-50/30 transition-all duration-300 relative overflow-hidden"
    >
      {/* Dynamic Background Shine Accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-500/5 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-300" />

      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-red-50 rounded-xl text-red-600 shadow-sm border border-red-100/50 group-hover:scale-105 transition-transform duration-200">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 tracking-tight leading-none">
              {title}
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">
              {englishLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Card Content Area */}
      <div className="flex-1 text-slate-700 text-sm md:text-base leading-relaxed z-10 pr-1">
        {Array.isArray(content) ? (
          <ul className="flex flex-col gap-2.5">
            {content.map((item, index) => (
              <li key={index} className="flex items-start gap-2.5 text-[13px] md:text-sm">
                <span className="flex items-center justify-center h-5 w-5 shrink-0 rounded-full bg-red-50 text-red-600 font-mono text-[10px] font-bold mt-0.5 border border-red-100">
                  {index + 1}
                </span>
                <span className="text-slate-700 font-medium leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="whitespace-pre-line text-[13px] md:text-sm font-medium leading-relaxed">
            {content}
          </p>
        )}
      </div>

      {/* Card Action footer */}
      <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4 mt-2 z-10">
        <button
          type="button"
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            copied
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-800'
          }`}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>కాపీ చేయబడింది!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>కాపీ (Copy)</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleDownload}
          title="Download as Text File"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-100 transition-all cursor-pointer"
        >
          <Download className="h-3.5 w-3.5" />
          <span>డౌన్‌లోడ్ (TXT)</span>
        </button>
      </div>
    </motion.div>
  );
}
