'use client';

import React, { useState, useEffect } from 'react';
import { sampleArticles, SampleArticle } from '../utils/sampleArticles';
import { Clipboard, Trash2, FileText, BookOpen, AlertTriangle, ShieldAlert } from 'lucide-react';

interface ArticleInputProps {
  value: string;
  onChange: (val: string) => void;
  onSelectPreset: (article: SampleArticle) => void;
  isLoading: boolean;
}

export default function ArticleInput({ value, onChange, onSelectPreset, isLoading }: ArticleInputProps) {
  const [securityWarning, setSecurityWarning] = useState<string | null>(null);

  const wordCount = value.trim() === '' ? 0 : value.trim().split(/\s+/).length;
  const charCount = value.length;

  // Automatically clear security warnings after 8 seconds
  useEffect(() => {
    if (securityWarning) {
      const timer = setTimeout(() => setSecurityWarning(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [securityWarning]);

  // Defensive Scan: Prevents pasting Gemini API keys (standard AIzaSy prefix)
  const handlePaste = async () => {
    setSecurityWarning(null);
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return;

      // Defensive scan: checks for API key signature
      if (/AIzaSy[A-Za-z0-9_-]*/i.test(text)) {
        setSecurityWarning(
          'సురక్షిత హెచ్చరిక: మీ క్లిప్‌బోర్డ్‌లో ఏఐ కీ (API Key) ఉన్నట్లు గుర్తించాము. భద్రతా కారణాల దృష్ట్యా ఇది ఇక్కడ పేస్ట్ చేయబడదు. (Security Alert: We detected an API Key in your clipboard. For security reasons, pasting is blocked.)'
        );
        return;
      }

      // Sanitize input content
      const sanitizedText = text.trim();
      onChange(sanitizedText);
    } catch (err) {
      console.error('Failed to read clipboard:', err);
      setSecurityWarning(
        'క్లిప్‌బోర్డ్ యాక్సెస్ విఫలమైంది. దయచేసి వార్తా కథనాన్ని మాన్యువల్‌గా పేస్ట్ చేయండి. (Unable to access clipboard. Please paste your news article manually.)'
      );
    }
  };

  // Real-time Textarea scan to prevent manual pastes/typing of API keys
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;

    if (/AIzaSy[A-Za-z0-9_-]*/i.test(val)) {
      setSecurityWarning(
        'భద్రతా హెచ్చరిక: వార్తా కథనంలో ఏఐ కీ (API Key) ని ఇన్‌పుట్ చేయవద్దు. భద్రత కొరకు ఇది నిరోధించబడింది. (Security Alert: Do not paste or write API Keys in the article field. Blocked for safety.)'
      );
      
      // Strip any API Key signature to prevent accidental leaks, leaving a placeholder
      const cleanedVal = val.replace(/AIzaSy[A-Za-z0-9_-]*/gi, '[API KEY REMOVED]');
      onChange(cleanedVal);
    } else {
      onChange(val);
    }
  };

  return (
    <div className="w-full bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-xl shadow-slate-100 flex flex-col gap-4">
      {/* Label and Presets Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-red-50 rounded-lg text-red-600">
            <FileText className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              వార్తా కథన ఇన్‌పుట్ (News Article Input)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Paste article below or choose a sample wire article</p>
          </div>
        </div>

        {/* Counter Indicators */}
        <div className="flex items-center gap-3 text-xs font-mono font-semibold text-slate-500 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          <span className="flex items-center gap-1">
            Words: <strong className="text-slate-800">{wordCount}</strong>
          </span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1">
            Chars: <strong className="text-slate-800">{charCount}</strong>
          </span>
        </div>
      </div>

      {/* Security Alerts Banner */}
      {securityWarning && (
        <div className="bg-red-50/90 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-start gap-2.5 text-xs font-medium shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          {securityWarning.includes('సురక్షిత హెచ్చరిక') || securityWarning.includes('భద్రతా') ? (
            <ShieldAlert className="h-4.5 w-4.5 text-red-600 shrink-0 mt-0.5 animate-bounce" />
          ) : (
            <AlertTriangle className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
          )}
          <span className="leading-relaxed">{securityWarning}</span>
        </div>
      )}

      {/* Preset Quick Fill Chips */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
          <BookOpen className="h-3.5 w-3.5 text-slate-400" />
          Quick-Fill Wire Presets:
        </span>
        <div className="flex flex-wrap gap-2">
          {sampleArticles.map((article) => {
            const categoryColors: Record<string, string> = {
              politics: 'hover:border-blue-300 hover:bg-blue-50/50 text-slate-700 border-slate-200',
              technology: 'hover:border-purple-300 hover:bg-purple-50/50 text-slate-700 border-slate-200',
              sports: 'hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-700 border-slate-200',
            };

            return (
              <button
                key={article.id}
                type="button"
                disabled={isLoading}
                onClick={() => {
                  setSecurityWarning(null);
                  onSelectPreset(article);
                }}
                className={`text-xs px-3 py-2 rounded-xl border transition-all duration-200 font-medium cursor-pointer shadow-sm text-left max-w-full sm:max-w-xs truncate ${
                  categoryColors[article.category] || 'hover:border-red-300 hover:bg-red-50/50 text-slate-700 border-slate-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {article.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Textarea Container */}
      <div className="relative group">
        <textarea
          rows={10}
          value={value}
          onChange={handleTextareaChange}
          placeholder="తెలుగు వార్తా వ్యాసాన్ని లేదా కథనాన్ని ఇక్కడ అతికించండి (ఉదాహరణ: ఆంధ్రప్రదేశ్ లో పారిశ్రామిక అభివృద్ధి...)..."
          className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200/80 rounded-xl px-4 py-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500 transition-all duration-300 text-sm md:text-base leading-relaxed resize-y font-normal"
          disabled={isLoading}
        />

        {/* Floating actions in Textarea */}
        <div className="absolute right-3.5 bottom-3.5 flex items-center gap-2">
          {value && (
            <button
              type="button"
              onClick={() => {
                setSecurityWarning(null);
                onChange('');
              }}
              disabled={isLoading}
              title="Clear text"
              className="bg-white/90 backdrop-blur-sm border border-slate-200 text-slate-600 p-2 rounded-xl hover:text-red-600 hover:border-red-200 shadow-sm transition-all cursor-pointer hover:scale-105"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={handlePaste}
            disabled={isLoading}
            title="Paste from clipboard"
            className="bg-white/90 backdrop-blur-sm border border-slate-200 text-slate-600 p-2 rounded-xl hover:text-red-600 hover:border-red-200 shadow-sm transition-all cursor-pointer hover:scale-105 flex items-center gap-1.5 text-xs font-semibold px-3"
          >
            <Clipboard className="h-4 w-4" />
            Paste Article
          </button>
        </div>
      </div>
    </div>
  );
}
