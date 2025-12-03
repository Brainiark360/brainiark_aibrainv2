// src/app/api/onboarding/remove-evidence/route.ts
import { NextResponse } from "next/server";
import { removeEvidenceSchema } from "@/lib/validators/onboarding";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import { OnboardingSession } from "@/lib/OnboardingSession";
import { Evidence } from "@/models/Evidence";

export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = removeEvidenceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { sessionId, evidenceId } = parsed.data;

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

    session.evidenceIds = session.evidenceIds.filter(
      (id) => id.toString() !== evidenceId
    );
    await session.save();

    await Evidence.deleteOne({
      _id: evidenceId,
      userId: user._id,
      workspaceId: session.workspaceId,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Remove evidence error", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
