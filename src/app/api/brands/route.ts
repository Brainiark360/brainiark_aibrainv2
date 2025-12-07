import { NextRequest, NextResponse } from 'next/server';

import { verifySession } from '@/lib/auth/session';
import { BrandCreateSchema } from '@/lib/zod/schemas';
import { connectToDatabase } from '@/db/db';
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

    // Create associated brand brain
    await BrandBrain.create({
      brandWorkspaceId: brand._id,
      status: 'not_started',
    });

    return NextResponse.json({
      success: true,
      data: {
        id: brand._id,
        name: brand.name,
        slug: brand.slug,
      },
    });
  } catch (error) {
    console.error('Create brand error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}