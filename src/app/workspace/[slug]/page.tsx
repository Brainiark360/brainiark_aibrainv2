// /app/workspace/[slug]/page.tsx
import { redirect } from 'next/navigation';

import { verifySession } from '@/lib/auth/session';
import { connectToDatabase } from '@/db/db';
import { BrandWorkspace } from '@/models/Workspace';
import { BrandBrain } from '@/models/BrandBrain';
import { Evidence } from '@/models/Evidence';

import type { OnboardingStep } from '@/types/onboarding';
import type {
  EvidenceItem,
  BrandBrainData,
} from '@/components/onboarding/OnboardingStateManager';
import WorkspaceShell, {
  WorkspaceSummary,
} from '@/components/workspace/WorkspaceShell';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Map numeric onboardingStep → string OnboardingStep
const NUMBER_TO_STEP: Record<number, OnboardingStep> = {
  1: 'intro',
  2: 'collecting_evidence',
  3: 'waiting_for_analysis',
  4: 'analyzing',
  5: 'reviewing_brand_brain',
};

// Map evidence DB type → UI type
function mapEvidenceType(type: string): EvidenceItem['type'] {
  switch (type) {
    case 'website':
      return 'url';
    case 'document':
      return 'file';
    case 'social':
    case 'manual':
      return 'text';
    case 'brand_name_search':
      return 'search';
    default:
      return 'text';
  }
}

export default async function WorkspacePage({ params }: PageProps) {
  const session = await verifySession();
  if (!session) {
    redirect('/auth/login');
  }

  await connectToDatabase();
  const { slug } = await params;

  // 1) Load workspace
  const brand = await BrandWorkspace.findOne({
    slug,
    ownerUserId: session.userId,
  })
    .lean()
    .exec();

  if (!brand) {
    redirect('/dashboard');
  }

  // 2) Load brand brain (if any)
  const brainDoc = await BrandBrain.findOne({
    brandWorkspaceId: brand._id,
  })
    .lean()
    .exec();

  // 3) Load existing evidence for this workspace
  const evidenceDocs = await Evidence.find({ brandSlug: slug })
    .sort({ createdAt: 1 })
    .lean()
    .exec();

  const initialEvidence: EvidenceItem[] = evidenceDocs.map((item) => ({
    id: String(item._id),
    content: (item.analyzedContent || item.value) as string,
    type: mapEvidenceType(String(item.type)),
    source: String(item.type),
    createdAt: item.createdAt.toISOString(),
    metadata: {
      originalValue: item.value as string,
      status: String(item.status ?? 'pending'),
      analyzedContent: item.analyzedContent as string | undefined,
      analysisSummary: item.analysisSummary as string | undefined,
      searchType:
        item.type === 'brand_name_search' ? 'brand_search' : undefined,
    },
  }));

  // 4) Compute initial onboarding step + brain DTO
  let initialStep: OnboardingStep = 'intro';
  let initialBrain: BrandBrainData | null = null;

  if (brainDoc) {
    const stepNumber: number =
      typeof brainDoc.onboardingStep === 'number'
        ? brainDoc.onboardingStep
        : 1;

    initialStep = NUMBER_TO_STEP[stepNumber] ?? 'intro';

    initialBrain = {
      _id: String(brainDoc._id),
      brandWorkspaceId: String(brainDoc.brandWorkspaceId),
      brandSlug: brainDoc.brandSlug,
      summary: brainDoc.summary ?? '',
      audience: brainDoc.audience ?? '',
      tone: brainDoc.tone ?? '',
      pillars: Array.isArray(brainDoc.pillars) ? brainDoc.pillars : [],
      offers: brainDoc.offers ?? '',
      competitors: Array.isArray(brainDoc.competitors)
        ? brainDoc.competitors
        : [],
      channels: Array.isArray(brainDoc.channels) ? brainDoc.channels : [],
      recommendations: [], // safe default; can be filled later by AI
      status: (brainDoc.status as BrandBrainData['status']) ?? 'not_started',
      isActivated: Boolean(brainDoc.isActivated),
      onboardingStep: stepNumber,
      lastAnalyzedAt: brainDoc.lastAnalyzedAt
        ? brainDoc.lastAnalyzedAt.toISOString()
        : undefined,
      analysisCompletedAt:
        brainDoc.analysisCompletedAt?.toISOString(),
      createdAt: brainDoc.createdAt
        ? brainDoc.createdAt.toISOString()
        : undefined,
      updatedAt: brainDoc.updatedAt
        ? brainDoc.updatedAt.toISOString()
        : undefined,
      gptAnalysisData: brainDoc.gptAnalysisData,
    };
  }

  // 5) Decide whether onboarding is needed
  const brainStatus = brainDoc?.status;
  const brainActivated = Boolean(brainDoc?.isActivated);

  const needsOnboarding =
    !brainDoc || brainStatus !== 'ready' || brainActivated !== true;

  const initialView: 'onboarding' | 'dashboard' = needsOnboarding
    ? 'onboarding'
    : 'dashboard';

  // 6) Prepare workspace summary for dashboard
  //    (You can replace this with real scoring logic later)
  const workspaceSummary: WorkspaceSummary = {
    userName: session.userId.slice(0, 8),
    workspaceName: brand.name,
    evidence: [],
    scores: {
      identityStrength: 87,
      toneClarity: 92,
      audienceConfidence: brainDoc?.audience ? 78 : 45,
      strategyReadiness: 65,
      completionScore: needsOnboarding ? 40 : 100,
    },
    insights: {
      toneSummary: brainDoc?.tone || 'Professional and clear',
      corePillars: (brainDoc?.pillars as string[]) || [
        'Brand Identity',
        'Market Position',
      ],
      audienceSegments: brainDoc?.audience
        ? [brainDoc.audience]
        : ['Target Audience'],
      keywords: ['Brand', 'Strategy', 'Growth'],
      brandArchetype: 'Established',
      writingStyle: brainDoc?.tone || 'Professional',
    },
    recommendations: [],
    recentActivity: [],
  };

  // 7) Render shell (client) that flips between onboarding & dashboard
  return (
    <WorkspaceShell
      brandName={brand.name}
      brandSlug={brand.slug}
      initialView={initialView}
      initialStep={initialStep}
      initialEvidence={initialEvidence}
      initialBrain={initialBrain}
      workspaceSummary={workspaceSummary}
    />
  );
}
