'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardHeader from '@/components/DashboardHeader';
import ArticleInput from '@/components/ArticleInput';
import ControlPanel from '@/components/ControlPanel';
import ProcessingState from '@/components/ProcessingState';
import OutputDashboard from '@/components/OutputDashboard';
import { SampleArticle } from '@/utils/sampleArticles';
import {
  Sparkles,
  BookOpen,
  Cpu,
  Newspaper,
  AlertTriangle,
  ExternalLink,
  Info,
} from 'lucide-react';

interface SummarizationData {
  shortSummary: string;
  detailedSummary: string;
  keyPoints: string[];
  whatsappFriendly: string;
  readerHighlights: string[];
  suggestedHeadlines: string[];
  socialMediaBrief: string;
}

export default function DashboardPage() {
  // Input States
  const [articleText, setArticleText] = useState<string>('');
  const [length, setLength] = useState<'Short' | 'Medium' | 'Detailed'>('Medium');
  const [tone, setTone] = useState<'Professional' | 'Simple' | 'Social Media' | 'Breaking News'>('Professional');

  // Request/Response States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfigError, setIsConfigError] = useState<boolean>(false);
  const [generatedData, setGeneratedData] = useState<SummarizationData | null>(null);

  // Quick Preset Loader
  const handleSelectPreset = (preset: SampleArticle) => {
    setArticleText(preset.content);
    setError(null);
  };

  // Submit Handler
  const handleAnalyzeNews = async () => {
    if (!articleText.trim()) return;

    setIsLoading(true);
    setError(null);
    setIsConfigError(false);
    setGeneratedData(null);

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          article: articleText,
          length,
          tone,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw {
          message: result.error || 'వార్తా సారాంశాన్ని పొందడంలో వైఫల్యం జరిగింది.',
          isConfigError: result.isConfigError || false,
        };
      }

      setGeneratedData(result.data);
    } catch (err: any) {
      console.error('Submission Error:', err);
      setError(err.message || 'సర్వర్ అభ్యర్థన విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.');
      setIsConfigError(err.isConfigError || false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col relative overflow-x-hidden font-sans">
      {/* 1. Premium Background Grid and Blobs */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_75%,transparent_100%)] opacity-35 pointer-events-none" />
      <div className="absolute top-[-10%] left-[5%] w-[40rem] h-[40rem] rounded-full bg-red-400/5 blur-3xl pointer-events-none" />
      <div className="absolute top-[20%] right-[-5%] w-[35rem] h-[35rem] rounded-full bg-rose-400/5 blur-3xl pointer-events-none" />

      {/* 2. Top Header */}
      <DashboardHeader />

      {/* 3. Main Workspace Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 z-10">
        {/* Left Column: Input and Configuration controls */}
        <section className="lg:col-span-5 flex flex-col gap-6 h-fit">
          <ArticleInput
            value={articleText}
            onChange={setArticleText}
            onSelectPreset={handleSelectPreset}
            isLoading={isLoading}
          />
          <ControlPanel
            length={length}
            setLength={setLength}
            tone={tone}
            setTone={setTone}
            onSubmit={handleAnalyzeNews}
            isLoading={isLoading}
            isDisabled={!articleText.trim()}
          />
        </section>

        {/* Right Column: Dynamic Output Display Panel */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {/* Status: Config/API Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full bg-red-50 border border-red-200/80 p-5 rounded-2xl flex gap-3.5 shadow-sm"
              >
                <AlertTriangle className="h-5.5 w-5.5 text-red-600 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-sm font-bold text-red-800 uppercase tracking-wider">
                    సిస్టమ్ లోపం (System Alert)
                  </h3>
                  <p className="text-xs md:text-sm text-red-700 font-medium leading-relaxed">
                    {error}
                  </p>
                  {isConfigError && (
                    <div className="mt-3 p-3 bg-white/80 rounded-xl border border-red-100 text-xs text-red-800 leading-relaxed font-semibold">
                      <span className="flex items-center gap-1.5 text-red-700 mb-1">
                        <Info className="h-3.5 w-3.5" /> Quick Guide:
                      </span>
                      To solve this, add <code className="bg-red-50 px-1 py-0.5 rounded border text-red-600 font-mono">GEMINI_API_KEY=your_actual_key</code> inside a local <code className="bg-red-50 px-1 py-0.5 rounded border text-red-600 font-mono">.env.local</code> file in the project root, then restart the Next.js dev server.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Status: Active Generation Loader */}
            {isLoading && (
              <ProcessingState key="loader" isLoading={isLoading} />
            )}

            {/* Status: Successful Output Display */}
            {generatedData && !isLoading && (
              <OutputDashboard key="dashboard" data={generatedData} />
            )}

            {/* Status: Idle/Welcome Screen Empty State */}
            {!isLoading && !generatedData && !error && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="w-full bg-white/60 border border-slate-200/60 backdrop-blur-sm rounded-2xl p-8 md:p-12 text-center flex flex-col items-center justify-center gap-6 shadow-xl shadow-slate-100 min-h-[480px]"
              >
                {/* Emblem */}
                <div className="relative">
                  <div className="absolute inset-0 bg-red-100 rounded-3xl blur-md opacity-50 scale-110" />
                  <div className="h-16 w-16 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center text-red-600 relative">
                    <Newspaper className="h-8 w-8" />
                  </div>
                </div>

                {/* Captions */}
                <div className="max-w-md flex flex-col gap-2">
                  <h3 className="text-lg md:text-xl font-bold text-slate-800">
                    మీడియా వర్క్‌స్పేస్ సిద్ధంగా ఉంది
                  </h3>
                  <p className="text-xs md:text-sm font-semibold text-slate-500 uppercase tracking-wider">
                    AI Telugu Editorial Workspace
                  </p>
                  <p className="text-xs md:text-sm text-slate-400 leading-relaxed mt-2 font-medium">
                    మీరు ఎడమ వైపున ఉన్న ఇన్‌పుట్ బాక్స్‌లో వార్తా కథనాన్ని పేస్ట్ చేసి లేదా నమూనా వ్యాసాలలో ఒకదానిని క్లిక్ చేసి సమర్పించండి. నిమిషాల్లో ప్రచురణకు తగిన హెడ్‌లైన్లు, వాట్సాప్ మరియు సోషల్ మీడియా సారాంశాలు స్వయంచాలకంగా సిద్ధమవుతాయి.
                  </p>
                </div>

                {/* Feature highlights chips */}
                <div className="flex flex-wrap items-center justify-center gap-3.5 max-w-lg mt-4">
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500">
                    <Cpu className="h-3.5 w-3.5 text-red-500" />
                    <span>Telugu NLP Analysis</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500">
                    <Sparkles className="h-3.5 w-3.5 text-red-500" />
                    <span>7 publication assets</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500">
                    <BookOpen className="h-3.5 w-3.5 text-red-500" />
                    <span>Custom tones & lengths</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* 4. Footer */}
      <footer className="w-full bg-white/40 backdrop-blur-sm border-t border-slate-200/80 py-4 px-6 mt-8 z-10 text-center text-xs font-semibold text-slate-400 tracking-wider">
        <span>
          © {new Date().getFullYear()} AI NEWSROOM ASSISTANT • POWERED BY GEMINI AI • DESIGNED FOR PORTFOLIO
        </span>
      </footer>
    </div>
  );
}
