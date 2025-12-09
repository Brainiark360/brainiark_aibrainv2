// /app/api/brands/route.ts
import { NextRequest, NextResponse } from 'next/server';

import { verifySession } from '@/lib/auth/session';
import { BrandCreateSchema } from '@/lib/zod/schemas';
import { connectToDatabase } from '@/db/db-optimized';
import { BrandWorkspace } from '@/models/Workspace';
import { BrandBrain } from '@/models/BrandBrain';

interface BrandListItem {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

interface BrandListResponse {
  success: boolean;
  data?: BrandListItem[];
  error?: string;
}

interface BrandCreateBody {
  name: string;
}

interface BrandCreateResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    slug: string;
  };
  error?: string;
}

export async function GET(_request: NextRequest): Promise<NextResponse<BrandListResponse>> {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const brands = await BrandWorkspace.find({
      ownerUserId: session.userId,
    })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    const data: BrandListItem[] = brands.map((brand) => ({
      id: String(brand._id),
      name: brand.name,
      slug: brand.slug,
      createdAt: brand.createdAt.toISOString(),
      updatedAt: brand.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: unknown) {
    console.error('Get brands error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<BrandCreateResponse>> {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const body = (await request.json()) as BrandCreateBody;
    const validation = BrandCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.errors[0]?.message ?? 'Invalid request',
        },
        { status: 400 }
      );
    }

    const { name } = validation.data;

    // Generate unique slug
    const baseSlug = name
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-');

    let slug = baseSlug;
    let counter = 1;

    // Ensure slug uniqueness
    // eslint-disable-next-line no-await-in-loop
    while (await BrandWorkspace.findOne({ slug }).lean().exec()) {
      slug = `${baseSlug}-${counter}`;
      counter += 1;
    }

    // Create brand workspace
    const brand = await BrandWorkspace.create({
      ownerUserId: session.userId,
      name,
      slug,
    });

    // Create associated BrandBrain as source of truth for onboarding state
    try {
      await BrandBrain.create({
        brandWorkspaceId: brand._id,
        brandSlug: slug,
        summary: '',
        audience: '',
        tone: '',
        pillars: [],
        recommendations: [],
        offers: '',
        competitors: [],
        channels: [],
        evidence: [],
        status: 'not_started', // onboarding status lives here
        isActivated: false,
        onboardingStep: 1,
      });
    } catch (brainError: unknown) {
      console.error('BrandBrain creation error:', brainError);

      await BrandWorkspace.findByIdAndDelete(brand._id).exec();

      let errorMessage = 'Failed to create brand configuration';

      if (
        typeof brainError === 'object' &&
        brainError !== null &&
        'code' in brainError &&
        (brainError as { code: number }).code === 11000
      ) {
        errorMessage = 'Brand configuration already exists for this workspace';
      }

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: String(brand._id),
        name: brand.name,
        slug: brand.slug,
      },
    });
  } catch (error: unknown) {
    console.error('Create brand error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Internal server error';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
