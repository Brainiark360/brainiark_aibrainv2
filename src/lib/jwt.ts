// /src/lib/jwt.ts
import jwt from "jsonwebtoken";

export interface AuthTokenPayload {
  userId: string;
  email: string;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set in environment variables.");
  }
  return secret;
}

export function signAuthToken(
  payload: AuthTokenPayload,
  options?: jwt.SignOptions
): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: "7d",
    ...(options ?? {}),
  });
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  return jwt.verify(token, getJwtSecret()) as AuthTokenPayload;
}
