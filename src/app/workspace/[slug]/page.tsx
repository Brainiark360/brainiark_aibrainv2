// /app/workspace/[slug]/page.tsx - UPDATED
import { BrandBrain } from '@/models/BrandBrain';
import OnboardingWorkspaceLayout from '@/components/onboarding/OnboardingWorkspaceLayout';
import { verifySession } from '@/lib/auth/session';
import { connectToDatabase } from '@/db/db';
import { BrandWorkspace } from '@/models/Workspace';
import { redirect } from 'next/navigation';
import WorkspaceDashboard from '@/components/workspace/WorkSpaceDashboard';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function WorkspacePage({ params }: PageProps) {
  const session = await verifySession();
  if (!session) {
    redirect('/auth/login');
  }

  await connectToDatabase();
  const { slug } = await params;

  const brand = await BrandWorkspace.findOne({ 
    slug,
    ownerUserId: session.userId 
  });

  if (!brand) {
    redirect('/dashboard');
  }

  const brandBrain = await BrandBrain.findOne({ 
    brandWorkspaceId: brand._id 
  });

  // Check if onboarding is needed
  const needsOnboarding = brandBrain?.status !== 'ready' && brandBrain?.isActivated !== true;

  // If onboarding is complete, show the full workspace dashboard
  if (!needsOnboarding && brandBrain) {
    const workspaceSummary = {
      userName: "Alex",
      workspaceName: brand.name,
      evidence: [],
      scores: {
        identityStrength: 87,
        toneClarity: 92,
        audienceConfidence: brandBrain.audience ? 78 : 45,
        strategyReadiness: 65,
        completionScore: 100
      },
      insights: {
        toneSummary: brandBrain.tone || "Professional and clear",
        corePillars: brandBrain.pillars || ["Brand Identity", "Market Position"],
        audienceSegments: brandBrain.audience ? [brandBrain.audience] : ["Target Audience"],
        keywords: ["Brand", "Strategy", "Growth"],
        brandArchetype: "Established",
        writingStyle: brandBrain.tone || "Professional"
      },
      recommendations: [],
      recentActivity: []
    };

    return (
      <div className="pb-16">
        <WorkspaceDashboard summary={workspaceSummary} />
      </div>
    );
  }

  // Show conversational AI onboarding
  return <OnboardingWorkspaceLayout />;
}