// /src/app/api/brand-workspaces/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getCurrentUser } from "@/lib/auth";
import { BrandWorkspace } from "@/models/Workspace";
import { BrandBrain } from "@/models/BrandBrain";
import { User } from "@/models/User";

function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

async function generateUniqueSlug(base: string): Promise<string> {
  let slug = base;
  let suffix = 0;
  
  while (true) {
    const exists = await BrandWorkspace.exists({ slug });
    if (!exists) return slug;
    
    suffix += 1;
    slug = `${base}-${suffix}`;
    if (suffix > 10) break;
  }
  return `${base}-${Date.now()}`;
}

export async function POST(req: NextRequest) {
  try {
    console.log("[BRAND_CREATE] Starting brand creation");
    
    const user = await getCurrentUser();
    if (!user) {
      console.log("[BRAND_CREATE] No authenticated user");
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("[BRAND_CREATE] Authenticated user:", user.id);

    const json = await req.json();
    console.log("[BRAND_CREATE] Request body:", json);

    if (!json || typeof json !== 'object' || !json.name) {
      return NextResponse.json(
        { success: false, error: "Brand name is required" },
        { status: 400 }
      );
    }

    const { name } = json;
    
    if (typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Brand name must be at least 2 characters" },
        { status: 400 }
      );
    }

    await connectDB();
    console.log("[BRAND_CREATE] Database connected");

    const fullUser = await User.findById(user.id).exec();
    if (!fullUser) {
      console.log("[BRAND_CREATE] User not found in database");
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    console.log("[BRAND_CREATE] Full user found:", fullUser._id);

    const slugBase = slugifyName(name);
    const slug = await generateUniqueSlug(slugBase);
    
    console.log("[BRAND_CREATE] Generated slug:", slug);

    // Create brand workspace
    const brandWorkspace = await BrandWorkspace.create({
      name: name.trim(),
      slug,
      ownerUserId: fullUser._id,
    });

    console.log("[BRAND_CREATE] BrandWorkspace created:", brandWorkspace._id);

    // Create AI thread ID
    const aiThreadId = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create BrandBrain - USE brandId INSTEAD of brandWorkspaceId
    const brandBrain = await BrandBrain.create({
      brandId: brandWorkspace._id, // Changed from brandWorkspaceId to brandId
      summary: "",
      audience: "",
      tone: "",
      pillars: [],
      offers: "",
      competitors: [],
      channels: [],
      evidence: [],
    });

    console.log("[BRAND_CREATE] BrandBrain created:", brandBrain._id);

    // Update workspace with AI thread and brain
    brandWorkspace.aiThreadId = aiThreadId;
    brandWorkspace.brainId = brandBrain._id;
    await brandWorkspace.save();

    // Update user
    fullUser.onboardingStatus = "in_progress";
    fullUser.workspaceId = brandWorkspace._id;
    await fullUser.save();

    console.log("[BRAND_CREATE] User updated, onboardingStatus:", fullUser.onboardingStatus);
    console.log("[BRAND_CREATE] User workspaceId:", fullUser.workspaceId);

    return NextResponse.json(
      {
        success: true,
        data: {
          slug: brandWorkspace.slug,
          brandWorkspaceId: brandWorkspace._id.toString(),
          aiThreadId: aiThreadId,
          brainId: brandBrain._id.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[BRAND_WORKSPACE_CREATE_ERROR]", error);
    
    // Handle duplicate key error specifically
    if (error.code === 11000) {
      console.error("Duplicate key error details:", error.keyPattern, error.keyValue);
      return NextResponse.json(
        { 
          success: false, 
          error: "Brand brain already exists for this workspace. Please try again." 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: "Failed to create brand workspace." },
      { status: 500 }
    );
  }
}