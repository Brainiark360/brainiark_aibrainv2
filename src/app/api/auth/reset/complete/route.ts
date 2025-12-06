// /src/app/api/auth/reset/complete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { resetCompleteSchema } from "@/lib/zod-schemas";
import { hashPassword } from "@/lib/auth";
import { User } from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = resetCompleteSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;

    await connectDB();
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Reset link is invalid or expired." },
        { status: 400 }
      );
    }

    user.passwordHash = await hashPassword(password);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[AUTH_RESET_COMPLETE_ERROR]", err);
    return NextResponse.json(
      { success: false, error: "Password reset failed." },
      { status: 500 }
    );
  }
}
