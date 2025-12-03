// src/app/api/onboarding/status/route.ts
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import { OnboardingSession } from "@/lib/OnboardingSession";
import { statusSchema } from "@/lib/validators/onboarding";
import { Evidence } from "@/models/Evidence";

export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = statusSchema.safeParse(body);
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

    const fusedCount = await Evidence.countDocuments({
      _id: { $in: session.evidenceIds },
      status: "fused",
    });

    return NextResponse.json(
      {
        step: session.step,
        processingProgress: session.processingProgress,
        fusedCount,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Onboarding status error", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
