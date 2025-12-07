// /app/api/brands/[slug]/onboarding/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/db/db";
import { BrandBrain } from "@/models/BrandBrain";
import { verifySession } from "@/lib/auth/session";
import { BrandWorkspace } from "@/models/Workspace";

const updateStepSchema = z.object({
  step: z.number().min(1).max(5),
});

function computeStatus(step: number): "not_started" | "in_progress" | "ready" {
  if (step >= 5) return "ready";
  if (step > 1) return "in_progress";
  return "not_started";
}

interface RouteParams {
  params: { slug: string };
}

/**
 * PATCH /api/brands/[slug]/onboarding
 * Updates onboarding step for a given brand workspace (slug-based).
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const startTime = Date.now();
  let workspaceId: string | null = null;

  try {
    console.log("=== PATCH Onboarding Start ===");

    const session = await verifySession();
    if (!session?.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    const { slug } = params;
    console.log("Slug:", slug);

    await connectToDatabase();

    const workspace = await BrandWorkspace.findOne({
      slug,
      ownerUserId: session.userId,
    }).exec();

    if (!workspace) {
      return NextResponse.json(
        {
          success: false,
          error: `Workspace "${slug}" not found or you don't have access`,
        },
        { status: 404 }
      );
    }

    workspaceId = workspace._id.toString();
    console.log("Workspace ID:", workspaceId);

    // Parse and validate body
    const body = await request.json();
    console.log("Request body:", body);

    const parsed = updateStepSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid step number. Must be between 1 and 5.",
        },
        { status: 400 }
      );
    }

    const step = parsed.data.step;
    const status = computeStatus(step);
    console.log("Updating onboarding step:", step, "status:", status);

    // Upsert BrandBrain for this workspace
    const brain = await BrandBrain.findOneAndUpdate(
      { brandWorkspaceId: workspace._id },
      {
        $setOnInsert: {
          brandWorkspaceId: workspace._id,
          brandSlug: slug,
        },
        $set: {
          onboardingStep: step,
          status,
          isActivated: step === 5,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    ).exec();

    // Update workspace status as well
    await BrandWorkspace.findByIdAndUpdate(workspace._id, {
      status,
      updatedAt: new Date(),
    }).exec();

    const elapsed = Date.now() - startTime;
    console.log(`=== PATCH Onboarding Complete in ${elapsed}ms ===`);

    return NextResponse.json({
      success: true,
      data: {
        step: brain.onboardingStep,
        isActivated: brain.isActivated,
      },
    });
  } catch (error: unknown) {
    const elapsed = Date.now() - startTime;
    console.error(`🚨 Onboarding PATCH error after ${elapsed}ms:`, error);

    let errorMessage = "Failed to update onboarding";
    let statusCode = 500;

    if (error instanceof Error) {
      if ((error as any).name === "MongoServerError") {
        const code = (error as any).code;
        if (code === 11000) {
          errorMessage =
            "Duplicate key error on BrandBrain. Check for legacy indexes on brandId or inconsistent data.";
        }
      } else if (error.name === "ValidationError") {
        errorMessage = `Validation error: ${error.message}`;
        statusCode = 400;
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        workspaceId,
        elapsedTime: elapsed,
      },
      { status: statusCode }
    );
  }
}

/**
 * GET /api/brands/[slug]/onboarding
 * Returns current onboarding step and activation state.
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    console.log("=== GET Onboarding Start ===");

    const session = await verifySession();
    if (!session?.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { slug } = params;
    await connectToDatabase();

    const workspace = await BrandWorkspace.findOne({
      slug,
      ownerUserId: session.userId,
    }).exec();

    if (!workspace) {
      return NextResponse.json(
        { success: false, error: "Workspace not found" },
        { status: 404 }
      );
    }

    const brain = await BrandBrain.findOne({
      brandWorkspaceId: workspace._id,
    }).exec();

    const elapsed = Date.now() - startTime;
    console.log(`=== GET Onboarding Complete in ${elapsed}ms ===`);

    return NextResponse.json({
      success: true,
      data: {
        step: brain?.onboardingStep ?? 1,
        isActivated: brain?.isActivated ?? false,
      },
    });
  } catch (error: unknown) {
    const elapsed = Date.now() - startTime;
    console.error(`Onboarding GET error after ${elapsed}ms:`, error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch onboarding status",
      },
      { status: 500 }
    );
  }
}
