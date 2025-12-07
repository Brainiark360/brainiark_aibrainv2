// /app/api/brands/[slug]/onboarding/evidence/route.ts
import { connectToDatabase } from '@/db/db-optimized';
import { requireAuth } from '@/lib/auth/auth';
import { evidenceRequestSchema, validateRequest } from '@/lib/validators/validation';
import { Evidence } from '@/models/Evidence';
import { BrandWorkspace } from '@/models/Workspace';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectToDatabase();
    
    const { slug } = await params;
    const { session, workspace, errorResponse } = await requireAuth(request, { slug });
    if (errorResponse) return errorResponse;
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    // Build query
    const query: any = { brandSlug: slug };
    if (status) query.status = status;
    if (type) query.type = type;
    
    // Fetch evidence
    const evidenceItems = await Evidence.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    
    return NextResponse.json({
      success: true,
      data: evidenceItems
    });
    
  } catch (error: any) {
    console.error('Evidence GET error:', error);
    
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectToDatabase();
    
    const { slug } = await params;
    const { session, workspace, errorResponse } = await requireAuth(request, { slug });
    if (errorResponse) return errorResponse;
    
    // Validate request
    const validation = await validateRequest(evidenceRequestSchema, request);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error, details: validation.details },
        { status: 400 }
      );
    }
    
    const { type, value } = validation.data;
    
    // Create evidence record
    const evidence = await Evidence.create({
      brandSlug: slug,
      brandWorkspaceId: workspace._id,
      type,
      value,
      status: 'processing',
      createdAt: new Date(),
    });
    
    // Update workspace activity
    await BrandWorkspace.findByIdAndUpdate(workspace._id, {
      lastActiveAt: new Date(),
    });
    
    return NextResponse.json({
      success: true,
      data: evidence
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Evidence POST error:', error);
    
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectToDatabase();
    
    const { slug } = await params;
    const { session, workspace, errorResponse } = await requireAuth(request, { slug });
    if (errorResponse) return errorResponse;
    
    // Get evidence ID from query params
    const { searchParams } = new URL(request.url);
    const evidenceId = searchParams.get('id');
    
    if (!evidenceId) {
      return NextResponse.json(
        { success: false, error: 'Evidence ID is required' },
        { status: 400 }
      );
    }
    
    // Delete evidence
    const result = await Evidence.findOneAndDelete({
      _id: evidenceId,
      brandSlug: slug,
    });
    
    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Evidence not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: { deleted: true, id: evidenceId }
    });
    
  } catch (error: any) {
    console.error('Evidence DELETE error:', error);
    
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}