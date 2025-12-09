// /app/api/brands/[slug]/onboarding/brain/route.ts
import { NextRequest, NextResponse } from 'next/server';

import { connectToDatabase } from '@/db/db-optimized';
import { optimizedRequireAuth } from '@/lib/optimized-middleware';
import { brainUpdateSchema, validateRequest } from '@/lib/validators/validation';
import { BrandBrain } from '@/models/BrandBrain';
import { BrandWorkspace } from '@/models/Workspace';

type BrainSection =
  | 'summary'
  | 'audience'
  | 'tone'
  | 'pillars'
  | 'recommendations'
  | 'offers'
  | 'competitors'
  | 'channels';

interface BrainGetResponse {
  success: boolean;
  data: unknown | null;
  error?: string;
}

interface BrainPatchResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  details?: unknown;
}

interface BrainCompleteResponse {
  success: boolean;
  data?: {
    brain: unknown;
    workspace: unknown;
    completedAt: string;
  };
  error?: string;
}

interface BrainRefineResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse<BrainGetResponse>> {
  try {
    await connectToDatabase();

    const { slug } = await params;
    const { errorResponse } = await optimizedRequireAuth(request, { slug });
    if (errorResponse) return errorResponse as NextResponse<BrainGetResponse>;

    const brandBrain = await BrandBrain.findOne({ brandSlug: slug }).lean().exec();

    if (!brandBrain) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    return NextResponse.json({
      success: true,
      data: brandBrain,
    });
  } catch (error: unknown) {
    console.error('Brain GET error:', error);

    return NextResponse.json(
      {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse<BrainPatchResponse>> {
  try {
    await connectToDatabase();

    const { slug } = await params;
    const { workspace, errorResponse } = await optimizedRequireAuth(request, { slug });
    if (errorResponse) return errorResponse as NextResponse<BrainPatchResponse>;

    const validation = await validateRequest(brainUpdateSchema, request);
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

    const updates = validation.data;

    const updatedBrain = await BrandBrain.findOneAndUpdate(
      { brandSlug: slug },
      {
        ...updates,
        updatedAt: new Date(),
        brandWorkspaceId: workspace._id,
      },
      { new: true, upsert: true, lean: true }
    ).exec();

    await BrandWorkspace.findByIdAndUpdate(workspace._id, {
      lastActiveAt: new Date(),
    }).exec();

    return NextResponse.json({
      success: true,
      data: updatedBrain,
    });
  } catch (error: unknown) {
    console.error('Brain PATCH error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse<BrainCompleteResponse>> {
  try {
    await connectToDatabase();

    const { slug } = await params;
    const { workspace, errorResponse } = await optimizedRequireAuth(request, { slug });
    if (errorResponse) return errorResponse as NextResponse<BrainCompleteResponse>;

    const [updatedBrain, updatedWorkspace] = await Promise.all([
      BrandBrain.findOneAndUpdate(
        { brandSlug: slug },
        {
          isActivated: true,
          status: 'ready',
          onboardingStep: 5,
          updatedAt: new Date(),
        },
        { new: true, lean: true }
      ).exec(),
      BrandWorkspace.findByIdAndUpdate(
        workspace._id,
        {
          lastActiveAt: new Date(),
          updatedAt: new Date(),
        },
        { new: true, lean: true }
      ).exec(),
    ]);

    if (!updatedBrain) {
      return NextResponse.json(
        { success: false, error: 'Brand brain not found' },
        { status: 404 }
      );
    }

    const completedAt = new Date().toISOString();

    return NextResponse.json({
      success: true,
      data: {
        brain: updatedBrain,
        workspace: updatedWorkspace,
        completedAt,
      },
    });
  } catch (error: unknown) {
    console.error('Brain POST (complete) error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse<BrainRefineResponse>> {
  try {
    await connectToDatabase();

    const { slug } = await params;
    const { errorResponse } = await optimizedRequireAuth(request, { slug });
    if (errorResponse) return errorResponse as NextResponse<BrainRefineResponse>;

    const body = (await request.json()) as { section?: BrainSection; content?: string };

    const { section, content } = body;

    if (!section || !content) {
      return NextResponse.json(
        { success: false, error: 'Section and content are required' },
        { status: 400 }
      );
    }

    const validSections: BrainSection[] = [
      'summary',
      'audience',
      'tone',
      'pillars',
      'recommendations',
      'offers',
      'competitors',
      'channels',
    ];

    if (!validSections.includes(section)) {
      return NextResponse.json(
        { success: false, error: 'Invalid section' },
        { status: 400 }
      );
    }

    const updateValue =
      section === 'pillars' ||
      section === 'recommendations' ||
      section === 'competitors' ||
      section === 'channels'
        ? content
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line.length > 0)
        : content;

    const updatedBrain = await BrandBrain.findOneAndUpdate(
      { brandSlug: slug },
      {
        [section]: updateValue,
        updatedAt: new Date(),
      },
      { new: true, lean: true }
    ).exec();

    if (!updatedBrain) {
      return NextResponse.json(
        { success: false, error: 'Brand brain not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedBrain,
    });
  } catch (error: unknown) {
    console.error('Brain refine (PUT) error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
