// /app/api/brands/[slug]/onboarding/state/route.ts - OPTIMIZED VERSION
import { connectToDatabase, findOneOptimized } from '@/db/db-optimized';
import { requireAuth } from '@/lib/auth/auth';
import { stateUpdateSchema, validateRequest } from '@/lib/validators/validation';
import { BrandBrain } from '@/models/BrandBrain';
import { BrandWorkspace } from '@/models/Workspace';
import { NextRequest, NextResponse } from 'next/server';


// Mapping between step names and numbers
const STEP_TO_NUMBER = {
  intro: 1,
  collecting_evidence: 2,
  waiting_for_analysis: 3,
  analyzing: 4,
  reviewing_brand_brain: 5,
  complete: 5,
} as const;

const STEP_TO_STATUS = {
  intro: 'not_started',
  collecting_evidence: 'in_progress',
  waiting_for_analysis: 'in_progress',
  analyzing: 'in_progress',
  reviewing_brand_brain: 'in_progress',
  complete: 'ready',
} as const;

const NUMBER_TO_STEP: Record<number, string> = {
  1: 'intro',
  2: 'collecting_evidence',
  3: 'waiting_for_analysis',
  4: 'analyzing',
  5: 'reviewing_brand_brain',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const startTime = Date.now();
  
  try {
    await connectToDatabase();
    
    // Await the params Promise
    const { slug } = await params;
    
    const { session, workspace, errorResponse } = await requireAuth(request, { slug });
    if (errorResponse) return errorResponse;
    
    // Use optimized find with lean for better performance
    let brandBrain = await findOneOptimized(BrandBrain, { brandSlug: slug });
    
    if (!brandBrain) {
      try {
        // Create initial brand brain with proper workspace ID
        brandBrain = await BrandBrain.create({
          brandWorkspaceId: workspace._id,
          brandSlug: slug,
          status: 'not_started',
          onboardingStep: 1,
          isActivated: false,
        });
        
        // Convert to plain object
        brandBrain = brandBrain.toObject();
      } catch (createError: any) {
        // If duplicate key error, try to find it again
        if (createError.code === 11000) {
          console.log('Duplicate key error, trying to find existing brand brain');
          brandBrain = await findOneOptimized(BrandBrain, { brandSlug: slug });
        } else {
          throw createError;
        }
      }
    }
    
    // Map step number to string
    const stepNumber = brandBrain?.onboardingStep || 1;
    const step = NUMBER_TO_STEP[stepNumber] || 'intro';
    
    const responseTime = Date.now() - startTime;
    console.log(`✅ State GET for ${slug}: ${responseTime}ms`);
    
    return NextResponse.json({
      success: true,
      data: {
        step,
        status: brandBrain?.status || 'not_started',
        onboardingStep: stepNumber,
        isActivated: brandBrain?.isActivated || false,
        updatedAt: brandBrain?.updatedAt || new Date(),
      }
    });
    
  } catch (error: any) {
    const errorTime = Date.now() - startTime;
    console.error(`❌ State GET error (${errorTime}ms):`, error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch onboarding state',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const startTime = Date.now();
  
  try {
    await connectToDatabase();
    
    // Await the params Promise
    const { slug } = await params;
    
    const { session, workspace, errorResponse } = await requireAuth(request, { slug });
    if (errorResponse) return errorResponse;
    
    // Validate request
    const validation = await validateRequest(stateUpdateSchema, request);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error, details: validation.details },
        { status: 400 }
      );
    }
    
    const { step } = validation.data;
    const stepNumber = STEP_TO_NUMBER[step];
    const status = STEP_TO_STATUS[step];
    
    try {
      // Use bulk write for better performance
      const [updatedWorkspace, updatedBrain] = await Promise.all([
        BrandWorkspace.findOneAndUpdate(
          { _id: workspace._id },
          {
            onboardingStep: stepNumber,
            status,
            lastActiveAt: new Date(),
          },
          { new: true, lean: true }
        ),
        BrandBrain.findOneAndUpdate(
          { brandSlug: slug },
          {
            onboardingStep: stepNumber,
            status,
            isActivated: step === 'complete' ? true : undefined,
          },
          { new: true, upsert: true, lean: true }
        )
      ]);
      
      const responseTime = Date.now() - startTime;
      console.log(`✅ State PATCH for ${slug}: ${responseTime}ms`);
      
      return NextResponse.json({
        success: true,
        data: {
          step,
          status,
          onboardingStep: stepNumber,
          isActivated: step === 'complete',
          updatedAt: updatedBrain?.updatedAt || new Date(),
        }
      });
    } catch (dbError: any) {
      // Handle duplicate key error
      if (dbError.code === 11000) {
        // Try to find the existing document and update it
        const existingBrain = await findOneOptimized(BrandBrain, { brandSlug: slug });
        
        if (existingBrain) {
          const updatedBrain = await BrandBrain.findByIdAndUpdate(
            existingBrain._id,
            {
              onboardingStep: stepNumber,
              status,
              isActivated: step === 'complete' ? true : undefined,
            },
            { new: true, lean: true }
          );
          
          return NextResponse.json({
            success: true,
            data: {
              step,
              status,
              onboardingStep: stepNumber,
              isActivated: step === 'complete',
              updatedAt: updatedBrain?.updatedAt || new Date(),
            }
          });
        }
      }
      throw dbError;
    }
    
  } catch (error: any) {
    const errorTime = Date.now() - startTime;
    console.error(`❌ State PATCH error (${errorTime}ms):`, error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update onboarding state',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}