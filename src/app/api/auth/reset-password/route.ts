import { NextRequest, NextResponse } from 'next/server';

import { ResetPasswordSchema } from '@/lib/zod/schemas';
import { connectToDatabase } from '@/db/db';
import { User } from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const validation = ResetPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: validation.error.errors[0].message 
        },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      // Return success even if user doesn't exist (security best practice)
      return NextResponse.json({ success: true });
    }

    // TODO: In production, send actual reset email
    // For now, just return success
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}