// src/app/api/brand-workspaces/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getCurrentUser } from "@/lib/auth";
import { BrandWorkspace } from "@/models/Workspace";

interface GetBrandWorkspaceSuccess {
  success: true;
  data: {
    name: string;
    slug: string;
    aiThreadId?: string;
    brainId?: string;
  };
}

interface GetBrandWorkspaceError {
  success: false;
  error: string;
}

interface RouteParams {
  params: { slug: string };
}

export async function GET(
  _req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<GetBrandWorkspaceSuccess | GetBrandWorkspaceError>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json<GetBrandWorkspaceError>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { slug } = params;

    await connectDB();

    const workspace = await BrandWorkspace.findOne({
      slug,
      ownerUserId: user.id,
    }).exec();

    if (!workspace) {
      return NextResponse.json<GetBrandWorkspaceError>(
        { success: false, error: "Brand workspace not found." },
        { status: 404 }
      );
    }

    return NextResponse.json<GetBrandWorkspaceSuccess>({
      success: true,
      data: {
        name: workspace.name,
        slug: workspace.slug,
        aiThreadId: workspace.aiThreadId,
        brainId: workspace.brainId?.toString(),
      },
    });
  } catch (error) {
    console.error("[GET_BRAND_WORKSPACE_ERROR]", error);
    return NextResponse.json<GetBrandWorkspaceError>(
      { success: false, error: "Failed to fetch brand workspace." },
      { status: 500 }
    );
  }
}
