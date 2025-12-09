// /app/api/brands/[slug]/onboarding/analyze/reset/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/db/db-optimized';
import { BrandBrain } from '@/models/BrandBrain';
import { BrandWorkspace } from '@/models/Workspace';
import { optimizedRequireAuth } from '@/lib/optimized-middleware';

interface ResetResponse {
  success: boolean;
  message?: string;
  error?: string;
  resetAt?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse<ResetResponse>> {
  try {
    await connectToDatabase();

    const { slug } = await params;
    const { workspace, errorResponse } = await optimizedRequireAuth(request, { slug });
    if (errorResponse) return errorResponse as NextResponse<ResetResponse>;

    if (!workspace?._id) {
      return NextResponse.json(
        { success: false, error: 'Workspace not found for this brand.' },
        { status: 404 }
      );
    }

    await BrandBrain.findOneAndUpdate(
      { brandWorkspaceId: workspace._id },
      {
        $set: {
          status: 'not_started',
          onboardingStep: 3,
          lastAnalyzedAt: null,
          analysisStartedAt: null,
          analysisCompletedAt: null,
          updatedAt: new Date(),
        },
      }
    ).exec();

    await BrandWorkspace.findByIdAndUpdate(workspace._id, {
      updatedAt: new Date(),
    }).exec();

    const resetAt = new Date().toISOString();
    console.log(`[ANALYZE-RESET] Analysis reset for ${slug} at ${resetAt}`);

    return NextResponse.json({
      success: true,
      message: 'Analysis reset successfully. You can now start a new analysis.',
      resetAt,
    });
  } catch (error: unknown) {
    console.error('[ANALYZE-RESET] Reset error:', error);

    const message =
      error instanceof Error ? error.message : 'Failed to reset analysis';

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
