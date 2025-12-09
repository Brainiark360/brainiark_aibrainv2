// /app/api/brands/[slug]/onboarding/state/route.ts
import { NextRequest, NextResponse } from 'next/server';

import { connectToDatabase, findOneOptimized } from '@/db/db-optimized';
import { optimizedRequireAuth } from '@/lib/optimized-middleware';
import { stateUpdateSchema, validateRequest } from '@/lib/validators/validation';
import { BrandBrain } from '@/models/BrandBrain';
import { BrandWorkspace } from '@/models/Workspace';
import type { OnboardingStep } from '@/types/onboarding';

type StateStep =
  | 'intro'
  | 'collecting_evidence'
  | 'waiting_for_analysis'
  | 'analyzing'
  | 'reviewing_brand_brain'
  | 'complete';

type StateStatus = 'not_started' | 'in_progress' | 'ready' | 'failed';

interface StateGetResponse {
  success: boolean;
  data?: {
    step: StateStep;
    status: StateStatus;
    onboardingStep: number;
    isActivated: boolean;
    updatedAt: string;
  };
  error?: string;
  details?: string;
}

interface StatePatchResponse {
  success: boolean;
  data?: {
    step: StateStep;
    status: StateStatus;
    onboardingStep: number;
    isActivated: boolean;
    updatedAt: string;
  };
  error?: string;
  details?: string;
}

const STEP_TO_NUMBER: Record<StateStep, number> = {
  intro: 1,
  collecting_evidence: 2,
  waiting_for_analysis: 3,
  analyzing: 4,
  reviewing_brand_brain: 5,
  complete: 5,
};

const STEP_TO_STATUS: Record<StateStep, StateStatus> = {
  intro: 'not_started',
  collecting_evidence: 'in_progress',
  waiting_for_analysis: 'in_progress',
  analyzing: 'in_progress',
  reviewing_brand_brain: 'in_progress',
  complete: 'ready',
};

const NUMBER_TO_STEP: Record<number, StateStep> = {
  1: 'intro',
  2: 'collecting_evidence',
  3: 'waiting_for_analysis',
  4: 'analyzing',
  5: 'reviewing_brand_brain',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse<StateGetResponse>> {
  const startTime = Date.now();

  try {
    await connectToDatabase();

    const { slug } = await params;
    const { errorResponse } = await optimizedRequireAuth(request, { slug });
    if (errorResponse) return errorResponse as NextResponse<StateGetResponse>;

    let brandBrain = await findOneOptimized(BrandBrain, { brandSlug: slug });

    if (!brandBrain) {
      // Create initial BrandBrain with onboarding defaults
      const workspace = await BrandWorkspace.findOne({ slug }).lean().exec();
      if (!workspace?._id) {
        return NextResponse.json(
          {
            success: false,
            error: 'Workspace not found',
          },
          { status: 404 }
        );
      }

      const createdBrain = await BrandBrain.create({
        brandWorkspaceId: workspace._id,
        brandSlug: slug,
        status: 'not_started',
        onboardingStep: 1,
        isActivated: false,
      });
      brandBrain = createdBrain.toObject();
    }

    const stepNumber: number = brandBrain.onboardingStep ?? 1;
    const step: StateStep = NUMBER_TO_STEP[stepNumber] ?? 'intro';
    const status: StateStatus = (brandBrain.status as StateStatus) ?? 'not_started';

    const responseTime = Date.now() - startTime;
    console.log(`✅ Onboarding state GET for ${slug}: ${responseTime}ms`);

    return NextResponse.json({
      success: true,
      data: {
        step,
        status,
        onboardingStep: stepNumber,
        isActivated: Boolean(brandBrain.isActivated),
        updatedAt: (brandBrain.updatedAt ?? new Date()).toISOString(),
      },
    });
  } catch (error: unknown) {
    const errorTime = Date.now() - startTime;
    console.error(`❌ State GET error (${errorTime}ms):`, error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch onboarding state',
        details: process.env.NODE_ENV === 'development' && error instanceof Error
          ? error.message
          : undefined,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse<StatePatchResponse>> {
  const startTime = Date.now();

  try {
    await connectToDatabase();

    const { slug } = await params;
    const { workspace, errorResponse } = await optimizedRequireAuth(request, { slug });
    if (errorResponse) return errorResponse as NextResponse<StatePatchResponse>;

    const validation = await validateRequest(stateUpdateSchema, request);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
          details: validation.details,
        },
        { status: 400 }
      );
    }

    const { step } = validation.data as { step: OnboardingStep };
    const stepKey = step as StateStep;

    const stepNumber = STEP_TO_NUMBER[stepKey];
    const status = STEP_TO_STATUS[stepKey];

    const updatedBrain = await BrandBrain.findOneAndUpdate(
      { brandSlug: slug },
      {
        onboardingStep: stepNumber,
        status,
        isActivated: stepKey === 'complete' ? true : undefined,
        updatedAt: new Date(),
        brandWorkspaceId: workspace._id,
      },
      { new: true, upsert: true, lean: true }
    ).exec();

    // We DO NOT store onboarding state in BrandWorkspace anymore,
    // but we do track activity:
    await BrandWorkspace.findByIdAndUpdate(workspace._id, {
      lastActiveAt: new Date(),
    }).exec();

    const responseTime = Date.now() - startTime;
    console.log(`✅ Onboarding state PATCH for ${slug}: ${responseTime}ms`);

    return NextResponse.json({
      success: true,
      data: {
        step: stepKey,
        status,
        onboardingStep: stepNumber,
        isActivated: stepKey === 'complete',
        updatedAt: (updatedBrain?.updatedAt ?? new Date()).toISOString(),
      },
    });
  } catch (error: unknown) {
    const errorTime = Date.now() - startTime;
    console.error(`❌ State PATCH error (${errorTime}ms):`, error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update onboarding state',
        details: process.env.NODE_ENV === 'development' && error instanceof Error
          ? error.message
          : undefined,
      },
      { status: 500 }
    );
  }
}
