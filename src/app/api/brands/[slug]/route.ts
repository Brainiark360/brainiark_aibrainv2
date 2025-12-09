// /app/api/brands/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/session';
import { connectToDatabase } from '@/db/db-optimized';
import { BrandWorkspace } from '@/models/Workspace';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

interface BrandDetailResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    slug: string;
    aiThreadId?: string | null;
    createdAt: string;
    updatedAt: string;
  };
  error?: string;
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<BrandDetailResponse>> {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const { slug } = await params;

    const brand = await BrandWorkspace.findOne({
      slug,
      ownerUserId: session.userId,
    })
      .lean()
      .exec();

    if (!brand) {
      return NextResponse.json(
        { success: false, error: 'Brand not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: String(brand._id),
        name: brand.name,
        slug: brand.slug,
        aiThreadId: brand.aiThreadId ?? null,
        createdAt: brand.createdAt.toISOString(),
        updatedAt: brand.updatedAt.toISOString(),
      },
    });
  } catch (error: unknown) {
    console.error('Get brand error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
