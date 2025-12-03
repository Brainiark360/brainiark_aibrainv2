// src/app/api/onboarding/complete/route.ts
import { NextResponse } from "next/server";

import { completeSchema } from "@/lib/validators/onboarding";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import { OnboardingSession } from "@/lib/OnboardingSession";
import { User } from "@/models/Users";
import { Evidence } from "@/models/Evidence";

export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = completeSchema.safeParse(body);
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

    // Mark evidence as fused
    await Evidence.updateMany(
      { _id: { $in: session.evidenceIds } },
      { $set: { status: "fused" } }
    );

    session.step = "complete";
    session.processingProgress = 100;
    await session.save();

    // Mark user as having at least one completed workspace
    await User.updateOne(
      { _id: user._id },
      { $set: { onboardingCompleted: true } }
    );

    return NextResponse.json(
      {
        workspaceId: session.workspaceId.toString(),
        sessionId: session._id.toString(),
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Onboarding complete error", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
