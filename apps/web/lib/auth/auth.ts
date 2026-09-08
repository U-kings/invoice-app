import { prisma } from "@repo/db";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

interface TokenUserPayload {
  id: string;
  role?: string | null;
  class?: string | null;
  subscription?: {
    status?: string | null;
    plan?: string | null;
  } | null;
}

// 1. Keep your centralized token generation
export function generateAccessToken(user: TokenUserPayload, sessionId: string): string {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET environment variable is missing from configuration.");
  }

  const subscriptionStatus = user.subscription?.status || "EXPIRED";
  const subscriptionPlan = user.subscription?.plan || "FREE";

  return jwt.sign(
    {
      userId: user.id,
      role: user.role,
      class: user.class,
      sessionId,
      subscriptionStatus,
      subscriptionPlan,
    },
    jwtSecret,
    { expiresIn: "7d" }
  );
}

// 2. New Reusable Core: Creates DB session record and attaches the secure HTTP-only cookie
export async function createSessionAndCookie(
  req: NextRequest,
  response: NextResponse,
  user: TokenUserPayload
) {
  // Extract tracking information identically
  const userAgent = req.headers.get("user-agent");
  const ipAddress =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip");

  // Create persistent database tracking session record
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      tokenId: crypto.randomUUID(),
      userAgent,
      ipAddress,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  // Generate the token
  const token = generateAccessToken(user, session.id);

  // Set the standardized cookie directly on the response object passed in
  response.cookies.set("token", token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  return { token, session };
}
