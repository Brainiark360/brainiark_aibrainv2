// /app/api/brands/[slug]/onboarding/brain/route.ts
import { connectToDatabase } from '@/db/db-optimized';
import { optimizedRequireAuth } from '@/lib/optimized-middleware';
import { brainUpdateSchema, validateRequest } from '@/lib/validators/validation';
import { BrandBrain } from '@/models/BrandBrain';
import { BrandWorkspace } from '@/models/Workspace';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectToDatabase();
    
    const { slug } = await params;
    const { session, workspace, errorResponse } = await optimizedRequireAuth(request, { slug });
    if (errorResponse) return errorResponse;
    
    // Get brand brain
    const brandBrain = await BrandBrain.findOne({ brandSlug: slug }).lean();
    
    if (!brandBrain) {
      return NextResponse.json({
        success: true,
        data: null // Return null instead of 404
      });
    }
    
    return NextResponse.json({
      success: true,
      data: brandBrain
    });
    
  } catch (error: any) {
    console.error('Brain GET error:', error);
    
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectToDatabase();
    
    const { slug } = await params;
    const { session, workspace, errorResponse } = await optimizedRequireAuth(request, { slug });
    if (errorResponse) return errorResponse;
    
    // Validate request
    const validation = await validateRequest(brainUpdateSchema, request);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error, details: validation.details },
        { status: 400 }
      );
    }
    
    const updates = validation.data;
    
    // Update brand brain
    const updatedBrain = await BrandBrain.findOneAndUpdate(
      { brandSlug: slug },
      {
        ...updates,
        updatedAt: new Date(),
      },
      { new: true, upsert: true, lean: true }
    );
    
    // Update workspace activity
    await BrandWorkspace.findByIdAndUpdate(workspace._id, {
      lastActiveAt: new Date(),
    });
    
    return NextResponse.json({
      success: true,
      data: updatedBrain
    });
    
  } catch (error: any) {
    console.error('Brain PATCH error:', error);
    
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
    const { session, workspace, errorResponse } = await optimizedRequireAuth(request, { slug });
    if (errorResponse) return errorResponse;
    
    // Mark onboarding as complete
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
      ),
      BrandWorkspace.findByIdAndUpdate(
        workspace._id,
        {
          status: 'ready',
          onboardingStep: 5,
          lastActiveAt: new Date(),
        },
        { new: true, lean: true }
      )
    ]);
    
    if (!updatedBrain) {
      return NextResponse.json(
        { success: false, error: 'Brand brain not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: {
        brain: updatedBrain,
        workspace: updatedWorkspace,
        completedAt: new Date(),
      }
    });
    
  } catch (error: any) {
    console.error('Brain POST error:', error);
    
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// For section refinement
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectToDatabase();
    
    const { slug } = await params;
    const { session, workspace, errorResponse } = await optimizedRequireAuth(request, { slug });
    if (errorResponse) return errorResponse;
    
    const body = await request.json();
    const { section, content } = body;
    
    if (!section || !content) {
      return NextResponse.json(
        { success: false, error: 'Section and content are required' },
        { status: 400 }
      );
    }
    
    // Validate section
    const validSections = ['summary', 'audience', 'tone', 'pillars', 'recommendations', 'offers', 'competitors', 'channels'];
    if (!validSections.includes(section)) {
      return NextResponse.json(
        { success: false, error: 'Invalid section' },
        { status: 400 }
      );
    }
    
    // For arrays, parse content
    const updateValue = ['pillars', 'recommendations', 'competitors', 'channels'].includes(section)
      ? content.split('\n').filter((line: string) => line.trim())
      : content;
    
    const updatedBrain = await BrandBrain.findOneAndUpdate(
      { brandSlug: slug },
      {
        [section]: updateValue,
        updatedAt: new Date(),
      },
      { new: true, lean: true }
    );
    
    if (!updatedBrain) {
      return NextResponse.json(
        { success: false, error: 'Brand brain not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: updatedBrain
    });
    
  } catch (error: any) {
    console.error('Brain refine error:', error);
    
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}