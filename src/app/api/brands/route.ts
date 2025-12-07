import { NextRequest, NextResponse } from 'next/server';

import { verifySession } from '@/lib/auth/session';
import { BrandCreateSchema } from '@/lib/zod/schemas';
import { connectToDatabase } from '@/db/db-optimized';
import { BrandWorkspace } from '@/models/Workspace';
import { BrandBrain } from '@/models/BrandBrain';

export async function GET(request: NextRequest) {
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
      ownerUserId: session.userId 
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: brands.map(brand => ({
        id: brand._id,
        name: brand.name,
        slug: brand.slug,
        createdAt: brand.createdAt,
        updatedAt: brand.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Get brands error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const validation = BrandCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: validation.error.errors[0].message 
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
    
    while (await BrandWorkspace.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create brand workspace
    const brand = await BrandWorkspace.create({
      ownerUserId: session.userId,
      name,
      slug,
    });

    // Create associated brand brain with ALL required fields
    try {
      await BrandBrain.create({
        brandWorkspaceId: brand._id,
        brandSlug: slug, // Required field
        summary: '',
        audience: '',
        tone: '',
        pillars: [],
        recommendations: [], // Add this field
        offers: '',
        competitors: [],
        channels: [],
        evidence: [],
        status: 'not_started',
        isActivated: false,
        onboardingStep: 1,
      });
    } catch (brainError: any) {
      console.error('BrandBrain creation error:', brainError);
      
      // If BrandBrain creation fails, delete the brand
      await BrandWorkspace.findByIdAndDelete(brand._id);
      
      // Provide specific error message
      let errorMessage = 'Failed to create brand configuration';
      if (brainError.code === 11000) {
        errorMessage = 'Brand configuration already exists for this workspace';
      } else if (brainError.errors) {
        // Get the first validation error
        const firstError = Object.values(brainError.errors)[0] as any;
        errorMessage = firstError.message || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: brand._id,
        name: brand.name,
        slug: brand.slug,
      },
    });
  } catch (error: any) {
    console.error('Create brand error:', error);
    
    // More specific error message
    const errorMessage = error.message || 'Internal server error';
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}