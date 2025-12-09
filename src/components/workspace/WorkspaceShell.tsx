// src/components/workspace/WorkspaceShell.tsx
'use client';

import { useState } from 'react';
import type { OnboardingStep } from '@/types/onboarding';
import type {
  EvidenceItem,
  BrandBrainData,
} from '@/components/onboarding/OnboardingStateManager';

import OnboardingWorkspaceLayout from '@/components/onboarding/OnboardingWorkspaceLayout';
import WorkspaceDashboard from '@/components/workspace/WorkSpaceDashboard';

export interface WorkspaceSummary {
  userName: string;
  workspaceName: string;
  evidence: unknown[];
  scores: {
    identityStrength: number;
    toneClarity: number;
    audienceConfidence: number;
    strategyReadiness: number;
    completionScore: number;
  };
  insights: {
    toneSummary: string;
    corePillars: string[];
    audienceSegments: string[];
    keywords: string[];
    brandArchetype: string;
    writingStyle: string;
  };
  recommendations: unknown[];
  recentActivity: unknown[];
}

interface WorkspaceShellProps {
  brandName: string;
  brandSlug: string;

  initialView: 'onboarding' | 'dashboard';

  initialStep: OnboardingStep;
  initialEvidence: EvidenceItem[];
  initialBrain: BrandBrainData | null;

  workspaceSummary: WorkspaceSummary;
}

/**
 * Client shell that switches between:
 * - Conversational onboarding
 * - Workspace dashboard
 *
 * No full page reloads — view flips client-side only.
 */
export default function WorkspaceShell({
  brandName,
  brandSlug,
  initialView,
  initialStep,
  initialEvidence,
  initialBrain,
  workspaceSummary,
}: WorkspaceShellProps) {
  const [view, setView] = useState<'onboarding' | 'dashboard'>(initialView);

  if (view === 'dashboard') {
    return (
      <div className="pb-16">
        <WorkspaceDashboard summary={workspaceSummary} />
      </div>
    );
  }

  return (
    <OnboardingWorkspaceLayout
      brandName={brandName}
      brandSlug={brandSlug}
      initialStep={initialStep}
      initialEvidence={initialEvidence}
      initialBrain={initialBrain}
      onComplete={() => setView('dashboard')}
    />
  );
}
