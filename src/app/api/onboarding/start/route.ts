// src/app/api/onboarding/start/route.ts
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { startOnboardingSchema } from "@/lib/validators/onboarding";
import { connectDB } from "@/lib/mongoose";
import { Workspace } from "@/models/Workspace";
import { OnboardingSession } from "@/lib/OnboardingSession";

export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = startOnboardingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { mode, workspaceName, inputMode } = parsed.data;

    await connectDB();

    const workspace = await Workspace.create({
      userId: user._id,
      name: workspaceName,
      mode,
      evidenceIds: [],
    });

    const session = await OnboardingSession.create({
      userId: user._id,
      workspaceId: workspace._id,
      mode,
      step: "greeting",
      inputMode,
      evidenceIds: [],
      processingProgress: 0,
    });

    return NextResponse.json(
      {
        sessionId: session._id.toString(),
        workspaceId: workspace._id.toString(),
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Onboarding start error", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
