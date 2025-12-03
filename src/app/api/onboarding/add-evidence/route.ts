// src/app/api/onboarding/add-evidence/route.ts
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { addEvidenceSchema } from "@/lib/validators/onboarding";
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
    const parsed = addEvidenceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { sessionId, type, label, url, fileId, rawText } = parsed.data;

    await connectDB();

    const session = await OnboardingSession.findOne({
      _id: sessionId,
      userId: user._id,
    }).populate("workspaceId");

    if (!session) {
      return NextResponse.json(
        { error: "Onboarding session not found" },
        { status: 404 }
      );
    }

    const evidence = await Evidence.create({
      userId: user._id,
      workspaceId: session.workspaceId,
      type,
      label,
      url,
      fileId,
      rawText,
      status: "queued",
    });

    session.evidenceIds.push(evidence._id);
    await session.save();

    // AI log hint
    let msg = "[Brainiark] Evidence added.";
    if (type === "website") msg = "[Brainiark] Website added — parsing metadata.";
    if (type === "document") msg = "[Brainiark] Document queued for text extraction.";
    if (type === "social") msg = "[Brainiark] Social profile added — analyzing content tone.";
    if (type === "name") msg = "[Brainiark] Name received — aligning identity context.";

    await AiLog.create({
      workspaceId: session.workspaceId,
      type: "system",
      message: msg,
    });

    return NextResponse.json(
      {
        evidenceId: evidence._id.toString(),
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Add evidence error", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
