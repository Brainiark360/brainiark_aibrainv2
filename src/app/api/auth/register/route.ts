// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/validators/auth";
import { createToken, hashPassword, setAuthCookie } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/Users";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      name,
      email,
      passwordHash,
      onboardingCompleted: false,
    });

    const token = await createToken({ userId: user._id.toString(), email });
    await setAuthCookie(token);

    return NextResponse.json(
      {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          onboardingCompleted: user.onboardingCompleted,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Register error", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
