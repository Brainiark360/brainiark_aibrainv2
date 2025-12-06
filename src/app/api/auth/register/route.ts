// /src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { registerSchema } from "@/lib/zod-schemas";
import { hashPassword } from "@/lib/auth";
import { signAuthToken } from "@/lib/jwt";
import { AUTH_COOKIE_NAME } from "@/lib/auth";
import { User } from "@/models/User";
import { BrandWorkspace } from "@/models/Workspace"; // Fixed import
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    console.log("[REGISTER] Starting registration process...");
    
    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log("[REGISTER] Request body received:", body);
    } catch (parseError: unknown) {
      console.error("[REGISTER] JSON parse error:", parseError);
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid JSON in request body" 
        },
        { status: 400 }
      );
    }
    
    // Validate with Zod
    const parsed = registerSchema.safeParse(body);
    
    if (!parsed.success) {
      console.log("[REGISTER] Zod validation failed. Errors:", parsed.error.errors);
      
      return NextResponse.json(
        { 
          success: false, 
          error: parsed.error.errors[0]?.message || "Invalid input"
        },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, phone, password } = parsed.data;
    console.log("[REGISTER] Validated data:", { firstName, lastName, email, phone });

    // Connect to database
    await connectDB();
    console.log("[REGISTER] Database connected");

    // Check for existing user
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      console.log("[REGISTER] User already exists with email:", email);
      return NextResponse.json(
        { success: false, error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);
    console.log("[REGISTER] Password hashed");

    // Create a slug from the email
    const slug = email.toLowerCase().split('@')[0].replace(/[^a-z0-9]/g, '-');

    // Use transaction to handle circular dependency
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Create workspace first with temporary ownerUserId
      const workspace = new BrandWorkspace({
        name: `${firstName}'s Workspace`,
        slug: slug,
        ownerUserId: new mongoose.Types.ObjectId(), // Temporary ID
      });

      await workspace.save({ session });

      // Create user with workspaceId
      const user = new User({
        firstName,
        lastName,
        email: email.toLowerCase(),
        phone,
        passwordHash,
        workspaceId: workspace._id,
        onboardingStatus: "not_started" as const,
        onboardingStep: 0,
      });

      await user.save({ session });

      // Update workspace with real ownerUserId
      workspace.ownerUserId = user._id;
      await workspace.save({ session });

      // Commit transaction
      await session.commitTransaction();
      console.log("[REGISTER] Transaction committed successfully");

      console.log("[REGISTER] User created:", user._id);
      console.log("[REGISTER] BrandWorkspace created:", workspace._id);

      // Create auth token
      const token = signAuthToken({
        userId: user._id.toString(),
        email: user.email,
      });
      console.log("[REGISTER] Auth token created");

      // Set response
      const res = NextResponse.json(
        { 
          success: true, 
          data: { 
            redirectTo: "/onboarding/select-brand",
            user: {
              id: user._id.toString(),
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName
            }
          } 
        },
        { status: 201 }
      );

      // Set auth cookie
      res.cookies.set(AUTH_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      console.log("[REGISTER] Registration successful!");
      return res;

    } catch (transactionError: unknown) {
      // Abort transaction on error
      await session.abortTransaction();
      throw transactionError;
    } finally {
      session.endSession();
    }

  } catch (err: unknown) {
    console.error("[AUTH_REGISTER_ERROR] Full error:", err);
    
    // Type-safe error handling
    if (err instanceof Error) {
      // Detailed error logging
      if ('name' in err && err.name === 'ValidationError') {
        console.error("[AUTH_REGISTER_ERROR] Mongoose Validation Error:", err);
      } else if ('code' in err && err.code === 11000) {
        console.error("[AUTH_REGISTER_ERROR] Duplicate key error:", err);
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Registration failed. Please try again.",
        details: process.env.NODE_ENV === 'development' && err instanceof Error ? err.message : undefined
      },
      { status: 500 }
    );
  }
}