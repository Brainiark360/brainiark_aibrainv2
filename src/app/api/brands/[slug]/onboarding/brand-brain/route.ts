import { NextRequest, NextResponse } from 'next/server';

import { verifySession } from '@/lib/auth/session';
import { BrandBrainUpdateSchema } from '@/lib/zod/schemas';
import { connectToDatabase } from '@/db/db';
import { BrandWorkspace } from '@/models/Workspace';
import { BrandBrain } from '@/models/BrandBrain';

interface Params {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
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

    // Get brand workspace
    const brand = await BrandWorkspace.findOne({ 
      slug,
      ownerUserId: session.userId 
    });

    if (!brand) {
      return NextResponse.json(
        { success: false, error: 'Brand not found' },
        { status: 404 }
      );
    }

    // Get brand brain
    const brandBrain = await BrandBrain.findOne({ 
      brandWorkspaceId: brand._id 
    });

    if (!brandBrain) {
      return NextResponse.json(
        { success: false, error: 'Brand brain not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: brandBrain,
    });
  } catch (error) {
    console.error('Get brand brain error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: Params) {
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

    // Get brand workspace
    const brand = await BrandWorkspace.findOne({ 
      slug,
      ownerUserId: session.userId 
    });

    if (!brand) {
      return NextResponse.json(
        { success: false, error: 'Brand not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = BrandBrainUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: validation.error.errors[0].message 
        },
        { status: 400 }
      );
    }

    // Update brand brain
    const brandBrain = await BrandBrain.findOneAndUpdate(
      { brandWorkspaceId: brand._id },
      validation.data,
      { new: true, upsert: true }
    );

    return NextResponse.json({
      success: true,
      data: brandBrain,
    });
  } catch (error) {
    console.error('Update brand brain error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}