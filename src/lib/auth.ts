// /src/lib/auth.ts
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { connectDB } from "./mongoose";
import { verifyAuthToken } from "./jwt";
import { IUser, User } from "@/models/User";

export const AUTH_COOKIE_NAME = "brain_session";

export interface AuthenticatedUser {
  id: string;
  email: string;
  onboardingStatus: IUser["onboardingStatus"];
  onboardingStep: number;
  workspaceId?: string | null;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifyAuthToken(token);
    await connectDB();
    const user = await User.findById(payload.userId).exec();
    if (!user) return null;

    return {
      id: user._id.toString(),
      email: user.email,
      onboardingStatus: user.onboardingStatus,
      onboardingStep: user.onboardingStep,
      workspaceId: user.workspaceId?.toString(),
    };
  } catch (err) {
    console.error("[getCurrentUser] Failed to decode token:", err);
    return null;
  }
}