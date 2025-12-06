// src/app/api/brand-workspaces/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getCurrentUser } from "@/lib/auth";
import { BrandWorkspace } from "@/models/Workspace";
import type { BrandWorkspaceSummary } from "@/types/brand";

interface GetBrandWorkspacesSuccess {
  success: true;
  data: BrandWorkspaceSummary[];
}

interface GetBrandWorkspacesError {
  success: false;
  error: string;
}

export async function GET(
  _req: NextRequest
): Promise<NextResponse<GetBrandWorkspacesSuccess | GetBrandWorkspacesError>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json<GetBrandWorkspacesError>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const workspaces = await BrandWorkspace.find({ ownerUserId: user.id })
      .sort({ createdAt: 1 })
      .select({ name: 1, slug: 1 })
      .lean()
      .exec();

    const summaries: BrandWorkspaceSummary[] = workspaces.map((w) => ({
      name: w.name,
      slug: w.slug,
    }));

    return NextResponse.json<GetBrandWorkspacesSuccess>({
      success: true,
      data: summaries,
    });
  } catch (error) {
    console.error("[GET_BRAND_WORKSPACES_ERROR]", error);
    return NextResponse.json<GetBrandWorkspacesError>(
      { success: false, error: "Failed to fetch brand workspaces." },
      { status: 500 }
    );
  }
}
