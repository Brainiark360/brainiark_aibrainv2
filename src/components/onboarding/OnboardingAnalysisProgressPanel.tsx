'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Brain, Sparkles } from 'lucide-react';

import type { OnboardingStep } from '@/types/onboarding';

interface OnboardingAnalysisProgressPanelProps {
  step: OnboardingStep;
  analysisProgress: string[];
  evidenceCount: number;
}

const DEFAULT_STEPS: string[] = [
  '🔵 Searching for brand information…',
  '🔵 Crawling website & public sources…',
  '🔵 Extracting messaging, tone, and positioning…',
  '🔵 Building your Brand Brain…',
];

export function OnboardingAnalysisProgressPanel({
  step,
  analysisProgress,
  evidenceCount,
}: OnboardingAnalysisProgressPanelProps) {
  const isAnalyzing = step === 'analyzing';
  const stepsToShow = analysisProgress.length > 0 ? analysisProgress : DEFAULT_STEPS;

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgb(var(--border))] bg-[rgb(var(--card)/0.9)]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[rgb(var(--os-accent-soft))] flex items-center justify-center">
            <Brain className="w-4 h-4 text-[rgb(var(--os-accent))]" />
          </div>
          <div>
            <p className="text-xs font-medium text-[rgb(var(--muted-foreground))] uppercase tracking-wide">
              Analysis
            </p>
            <p className="text-xs text-[rgb(var(--muted-foreground))]">
              {isAnalyzing ? 'Building your Brand Brain…' : 'Ready to analyze'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-[rgb(var(--muted-foreground))]">
          <Sparkles className="w-3 h-3 text-[rgb(var(--os-accent))]" />
          <span>{evidenceCount} evidence</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 px-4 py-4 space-y-4 bg-[rgb(var(--os-surface))]">
        <div className="flex items-center gap-2 text-xs text-[rgb(var(--muted-foreground))]">
          <div className="w-6 h-6 rounded-full bg-[rgb(var(--secondary))] flex items-center justify-center">
            <Loader2 className="w-3 h-3 animate-spin text-[rgb(var(--os-accent))]" />
          </div>
          <p>
            {isAnalyzing
              ? 'I’m researching your brand and its public presence to build a strategic Brand Brain.'
              : 'Everything looks ready. When you start analysis, I’ll research your brand and build your Brand Brain.'}
          </p>
        </div>

        <div className="border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--card))] px-3 py-2">
          <p className="text-[11px] font-medium text-[rgb(var(--foreground))] mb-1">
            Analysis steps
          </p>
          <ul className="space-y-1.5">
            {stepsToShow.map((line) => (
              <li
                key={line}
                className="flex items-center gap-2 text-[11px] text-[rgb(var(--muted-foreground))]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--os-accent))]" />
                <span className="truncate">{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-[11px] text-[rgb(var(--muted-foreground))] border-t border-[rgb(var(--border))] pt-3">
          <p>
            Brainiark uses OpenAI web research and crawling to understand your
            brand’s positioning, tone, and audience — then turns that into a
            structured Brand Brain.
          </p>
        </div>
      </div>
    </>
  );
}
