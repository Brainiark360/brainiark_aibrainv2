// /src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/zod-schemas";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";
import { verifyPassword } from "@/lib/auth";
import { signAuthToken } from "@/lib/jwt";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return NextResponse.json(
        { success: false, error: issue?.message ?? "Invalid login credentials." },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const lowerEmail = email.toLowerCase();

    await connectDB();

    // Lookup user
    const user = await User.findOne({ email: lowerEmail });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Incorrect email or password." },
        { status: 401 }
      );
    }

    // Validate password
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: "Incorrect email or password." },
        { status: 401 }
      );
    }

    // Issue JWT
    const token = signAuthToken({
      userId: user._id.toString(),
      email: user.email,
    });

    const res = NextResponse.json(
      {
        success: true,
        data: {
          redirectTo:
            user.onboardingStatus === "completed"
              ? `/workspace/${user.workspaceId}`
              : `/onboarding`,
        },
      },
      { status: 200 }
    );

    // Set cookie
    res.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err) {
    console.error("[AUTH_LOGIN_ERROR]", err);

    const message =
      process.env.NODE_ENV === "development" && err instanceof Error
        ? err.message
        : "Login failed. Please try again.";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
