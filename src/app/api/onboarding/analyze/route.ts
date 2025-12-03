// src/app/api/onboarding/analyze/route.ts
import { NextResponse } from "next/server";
import { analyzeSchema } from "@/lib/validators/onboarding";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import { OnboardingSession } from "@/lib/OnboardingSession";
import { Evidence } from "@/models/Evidence";
import { AiLog } from "@/models/AiLog";

export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = analyzeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { sessionId } = parsed.data;

    await connectDB();

    const session = await OnboardingSession.findOne({
      _id: sessionId,
      userId: user._id,
    });

    if (!session) {
      return NextResponse.json(
        { error: "Onboarding session not found" },
        { status: 404 }
      );
    }

    const evidence = await Evidence.find({
      _id: { $in: session.evidenceIds },
    });

    // Mark as processing
    await Evidence.updateMany(
      { _id: { $in: session.evidenceIds } },
      { $set: { status: "processing" } }
    );

    await AiLog.create({
      workspaceId: session.workspaceId,
      type: "system",
      message: "[Brainiark] Fusing evidence into workspace profile...",
    });

    // MOCK: pretend we processed evidence
    session.step = "processing";
    session.processingProgress = 25;
    await session.save();

    // In real system, you'd enqueue a job and return job status
    return NextResponse.json(
      {
        sessionId: session._id.toString(),
        workspaceId: session.workspaceId.toString(),
        evidenceCount: evidence.length,
        status: "processing",
      },
      { status: 202 }
    );
  } catch (err) {
    console.error("Onboarding analyze error", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
