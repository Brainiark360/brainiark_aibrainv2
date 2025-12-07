import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/auth/session';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/db/db';
import { User } from '@/models/User';

export async function POST(request: NextRequest) {
  console.log('🔧 Starting registration process...');
  
  try {
    // Connect to database
    await connectToDatabase();
    console.log('✅ Database connected - readyState:', mongoose.connection.readyState);

    // Parse request body
    const body = await request.json();
    console.log('📦 Request body received');

    // Basic validation
    if (!body.firstName?.trim()) {
      return NextResponse.json(
        { success: false, error: 'First name is required' },
        { status: 400 }
      );
    }

    if (!body.lastName?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Last name is required' },
        { status: 400 }
      );
    }

    if (!body.email?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!body.password) {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      );
    }

    if (body.password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const email = body.email.toLowerCase().trim();
    const now = new Date();

    // Check if user already exists
    console.log('🔍 Checking for existing user with email:', email);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists');
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(body.password, salt);
    console.log('✅ Password hashed');

    // Create user with manual timestamps
    const userData = {
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      email: email,
      phone: body.phone?.trim() || undefined,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    };

    console.log('👤 Creating user...');
    
    // Use create method without any middleware
    const user = await User.create(userData);
    console.log('✅ User created with ID:', user._id);

    // Create session
    console.log('🔑 Creating session...');
    await createSession(user._id.toString());
    console.log('✅ Session created');

    return NextResponse.json({
      success: true,
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });

  } catch (error: any) {
    console.error('❌ Registration error details:', error);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error message:', error.message);
    
    if (error.name === 'MongoServerError') {
      if (error.code === 11000) {
        return NextResponse.json(
          { success: false, error: 'User with this email already exists' },
          { status: 409 }
        );
      }
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: messages.join(', ') },
        { status: 400 }
      );
    }

    // Handle specific mongoose errors
    if (error.name === 'MongooseError') {
      return NextResponse.json(
        { success: false, error: 'Database error: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Registration failed. Please try again.',
        // Only show stack in development
        ...(process.env.NODE_ENV === 'development' && { 
          details: error.message,
          stack: error.stack 
        })
      },
      { status: 500 }
    );
  }
}