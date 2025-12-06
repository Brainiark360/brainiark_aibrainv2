// /src/app/api/auth/reset/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import crypto from "crypto";
import { resetRequestSchema } from "@/lib/zod-schemas";
import { User } from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = resetRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    await connectDB();
    const user = await User.findOne({ email }).exec();

    if (!user) {
      // For security: always return success
      return NextResponse.json({ success: true });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = Date.now() + 1000 * 60 * 30; // 30 min

    user.resetToken = token;
    user.resetTokenExpiry = expiry;
    await user.save();

    console.log("Reset token:", token); // TODO: Replace with real email

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[AUTH_RESET_ERROR]", err);
    return NextResponse.json(
      { success: false, error: "Reset request failed." },
      { status: 500 }
    );
  }
}
