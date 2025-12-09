'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useOnboarding } from './OnboardingStateManager';
import type { OnboardingStep } from '@/types/onboarding';
import { OnboardingBrandBrainReviewPanel } from './OnboardingBrandBrainReviewPanel';
import { OnboardingAnalysisProgressPanel } from './OnboardingAnalysisProgressPanel';
import { OnboardingEvidencePanel } from './OnboardingEvidencePanel';


interface OnboardingRightPanelProps {
  className?: string;
}

function isAnalysisStep(step: OnboardingStep): boolean {
  return step === 'waiting_for_analysis' || step === 'analyzing';
}

function isReviewStep(step: OnboardingStep): boolean {
  return step === 'reviewing_brand_brain' || step === 'complete';
}

export function OnboardingRightPanel({ className }: OnboardingRightPanelProps) {
  const { step, evidence, brandBrain, analysisProgress, isProcessing } =
    useOnboarding();

  let content: React.ReactNode;

  if (isReviewStep(step) && brandBrain) {
    content = (
      <OnboardingBrandBrainReviewPanel
        step={step}
        brain={brandBrain}
        isProcessing={isProcessing}
      />
    );
  } else if (isAnalysisStep(step)) {
    content = (
      <OnboardingAnalysisProgressPanel
        step={step}
        analysisProgress={analysisProgress}
        evidenceCount={evidence.length}
      />
    );
  } else {
    content = <OnboardingEvidencePanel evidence={evidence} step={step} />;
  }

  return (
    <motion.section
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex flex-col rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--os-surface))] backdrop-blur-sm h-full ${className ?? ''}`}
    >
      {content}
    </motion.section>
  );
}
