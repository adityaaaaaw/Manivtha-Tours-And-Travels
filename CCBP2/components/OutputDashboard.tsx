'use client';

import React from 'react';
import { motion } from 'framer-motion';
import OutputCard from './OutputCard';
import {
  Sparkles,
  BookOpen,
  AlignLeft,
  ListChecks,
  Zap,
  MessageCircle,
  Share2,
  FileJson,
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

interface OutputDashboardProps {
  data: SummarizationData | null;
}

export default function OutputDashboard({ data }: OutputDashboardProps) {
  if (!data) return null;

  const cardContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      variants={cardContainer}
      initial="hidden"
      animate="show"
      className="w-full flex flex-col gap-6"
    >
      {/* 1. Header indicators */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-red-50 rounded-lg text-red-600">
            <FileJson className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              రూపొందించిన ఎడిటోరియల్ అసెట్స్ (AI Generated Editorial Suite)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Copy or download assets below for instant publication</p>
          </div>
        </div>
      </div>

      {/* 2. Responsive Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Full-width Headline card */}
        <div className="md:col-span-2">
          <OutputCard
            title="సూచించబడిన తెలుగు వార్తా శీర్షికలు"
            englishLabel="Suggested Headlines"
            content={data.suggestedHeadlines}
            icon={Sparkles}
            downloadFileName="telugu_news_headlines"
          />
        </div>

        {/* Short Summary */}
        <OutputCard
          title="లఘు వార్తా సారాంశం"
          englishLabel="Short Summary"
          content={data.shortSummary}
          icon={BookOpen}
          downloadFileName="telugu_news_short_summary"
        />

        {/* Detailed Summary */}
        <OutputCard
          title="వివరణాత్మక వార్తా సారాంశం"
          englishLabel="Detailed Summary"
          content={data.detailedSummary}
          icon={AlignLeft}
          downloadFileName="telugu_news_detailed_summary"
        />

        {/* Key Points */}
        <OutputCard
          title="ప్రధాన ముఖ్యాంశాలు"
          englishLabel="Key Facts & Points"
          content={data.keyPoints}
          icon={ListChecks}
          downloadFileName="telugu_news_key_points"
        />

        {/* Reader Highlights */}
        <OutputCard
          title="పాఠకుల హైలైట్స్"
          englishLabel="Reader Highlights"
          content={data.readerHighlights}
          icon={Zap}
          downloadFileName="telugu_news_reader_highlights"
        />

        {/* WhatsApp Friendly */}
        <OutputCard
          title="వాట్సాప్ షేరింగ్ కంటెంట్"
          englishLabel="WhatsApp Friendly Summary"
          content={data.whatsappFriendly}
          icon={MessageCircle}
          downloadFileName="telugu_news_whatsapp_brief"
        />

        {/* Social Media Brief */}
        <OutputCard
          title="సోషల్ మీడియా ప్రమోషన్"
          englishLabel="Social Media Post"
          content={data.socialMediaBrief}
          icon={Share2}
          downloadFileName="telugu_news_social_media"
        />
      </div>
    </motion.div>
  );
}
