// /app/api/brands/[slug]/onboarding/evidence/route.ts
import { NextRequest, NextResponse } from 'next/server';

import { connectToDatabase } from '@/db/db-optimized';
import { processEvidence } from '@/lib/ai/evidence-processor';
import { requireAuth } from '@/lib/auth/auth';
import {
  evidenceRequestSchema,
  validateRequest,
} from '@/lib/validators/validation';
import { Evidence } from '@/models/Evidence';
import { BrandWorkspace } from '@/models/Workspace';

type EvidenceMappedType = 'text' | 'image' | 'url' | 'file' | 'search';

interface EvidenceItemResponse {
  id: string;
  content: string;
  type: EvidenceMappedType;
  source: string;
  createdAt: string;
  metadata: {
    originalValue: string;
    status: string;
    analyzedContent?: string;
    analysisSummary?: string;
    searchType?: string;
  };
}

interface EvidenceListResponse {
  success: boolean;
  data?: EvidenceItemResponse[];
  error?: string;
}

interface EvidenceSingleResponse {
  success: boolean;
  data?: EvidenceItemResponse;
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse<EvidenceListResponse>> {
  try {
    await connectToDatabase();

    const { slug } = await params;
    const { errorResponse } = await requireAuth(request, { slug });
    if (errorResponse) return errorResponse as NextResponse<EvidenceListResponse>;

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const typeParam = searchParams.get('type');
    const limit = Number.parseInt(searchParams.get('limit') || '50', 10);

    const query: Record<string, unknown> = { brandSlug: slug };
    if (statusParam) query.status = statusParam;
    if (typeParam) query.type = typeParam;

    const evidenceItems = await Evidence.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();

    const transformedEvidence: EvidenceItemResponse[] = evidenceItems.map((item) => ({
      id: String(item._id),
      content: (item.analyzedContent || item.value) as string,
      type: mapEvidenceType(item.type),
      source: item.type,
      createdAt: item.createdAt.toISOString(),
      metadata: {
        originalValue: item.value as string,
        status: item.status ?? 'pending',
        analyzedContent: item.analyzedContent as string | undefined,
        analysisSummary: item.analysisSummary as string | undefined,
        searchType: item.type === 'brand_name_search' ? 'brand_search' : undefined,
      },
    }));

    return NextResponse.json({
      success: true,
      data: transformedEvidence,
    });
  } catch (error: unknown) {
    console.error('Evidence GET error:', error);

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
): Promise<NextResponse<EvidenceSingleResponse>> {
  try {
    await connectToDatabase();

    const { slug } = await params;
    const { workspace, errorResponse } = await requireAuth(request, { slug });
    if (errorResponse) return errorResponse as NextResponse<EvidenceSingleResponse>;

    const validation = await validateRequest(evidenceRequestSchema, request);
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

    const { type, value } = validation.data;

    const evidence = await Evidence.create({
      brandSlug: slug,
      brandWorkspaceId: workspace._id,
      type,
      value,
      status: 'pending',
      createdAt: new Date(),
    });

    await BrandWorkspace.findByIdAndUpdate(workspace._id, {
      lastActiveAt: new Date(),
    }).exec();

    // background processing
    setTimeout(async () => {
      try {
        await processEvidence(
          String(evidence._id),
          type,
          value,
          slug,
          String(workspace._id)
        );
      } catch (processError: unknown) {
        console.error('Background processing failed:', processError);
        await Evidence.findByIdAndUpdate(evidence._id, {
          status: 'failed',
          analyzedContent: value,
          analysisError:
            processError instanceof Error
              ? processError.message
              : 'Processing failed',
          processingCompletedAt: new Date(),
          processedWithError: true,
        }).exec();
      }
    }, 100);

    const responseData: EvidenceItemResponse = {
      id: String(evidence._id),
      content: evidence.value as string,
      type: mapEvidenceType(evidence.type),
      source: evidence.type,
      createdAt: evidence.createdAt.toISOString(),
      metadata: {
        originalValue: evidence.value as string,
        status: evidence.status ?? 'pending',
        analyzedContent: evidence.analyzedContent as string | undefined,
        analysisSummary: evidence.analysisSummary as string | undefined,
      },
    };

    return NextResponse.json(
      {
        success: true,
        data: responseData,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Evidence POST error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse<EvidenceSingleResponse>> {
  try {
    await connectToDatabase();

    const { slug } = await params;
    const { errorResponse } = await requireAuth(request, { slug });
    if (errorResponse) return errorResponse as NextResponse<EvidenceSingleResponse>;

    const body = (await request.json()) as {
      id?: string;
      status?: string;
      analyzedContent?: string;
      analysisSummary?: string;
    };

    const { id, status, analyzedContent, analysisSummary } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Evidence ID is required' },
        { status: 400 }
      );
    }

    const update: Record<string, unknown> = {
      updatedAt: new Date(),
    };
    if (status) update.status = status;
    if (analyzedContent) update.analyzedContent = analyzedContent;
    if (analysisSummary) update.analysisSummary = analysisSummary;

    const updatedEvidence = await Evidence.findOneAndUpdate(
      {
        _id: id,
        brandSlug: slug,
      },
      update,
      { new: true, runValidators: true }
    )
      .lean()
      .exec();

    if (!updatedEvidence) {
      return NextResponse.json(
        { success: false, error: 'Evidence not found' },
        { status: 404 }
      );
    }

    const responseData: EvidenceItemResponse = {
      id: String(updatedEvidence._id),
      content:
        (updatedEvidence.analyzedContent as string | undefined) ??
        (updatedEvidence.value as string),
      type: mapEvidenceType(updatedEvidence.type),
      source: updatedEvidence.type,
      createdAt: updatedEvidence.createdAt.toISOString(),
      metadata: {
        originalValue: updatedEvidence.value as string,
        status: updatedEvidence.status ?? 'pending',
        analyzedContent: updatedEvidence.analyzedContent as string | undefined,
        analysisSummary: updatedEvidence.analysisSummary as string | undefined,
      },
    };

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error: unknown) {
    console.error('Evidence PATCH error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<
  NextResponse<{
    success: boolean;
    data?: { deleted: boolean; id: string; message: string };
    error?: string;
  }>
> {
  try {
    await connectToDatabase();

    const { slug } = await params;
    const { errorResponse } = await requireAuth(request, { slug });
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const evidenceId = searchParams.get('id');

    if (!evidenceId) {
      return NextResponse.json(
        { success: false, error: 'Evidence ID is required' },
        { status: 400 }
      );
    }

    const result = await Evidence.findOneAndDelete({
      _id: evidenceId,
      brandSlug: slug,
    }).exec();

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Evidence not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        deleted: true,
        id: evidenceId,
        message: 'Evidence successfully deleted',
      },
    });
  } catch (error: unknown) {
    console.error('Evidence DELETE error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

function mapEvidenceType(type: string): EvidenceMappedType {
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
