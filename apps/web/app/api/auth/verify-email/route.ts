import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "@repo/db"; // 🚀 1. Import your newly configured Prisma 7 client

const querySchema = z.object({
  token: z
    .string({ message: "Verification token is required" })
    .length(64, "Token must be exactly 64 characters long"),
});

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const rawQueryParams = { token: searchParams.get("token") };

    const result = querySchema.safeParse(rawQueryParams);

    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Invalid request payload";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { token } = result.data;

    // Hash the token to match how it was securely stored during registration
    const hashedToken: string = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // 🚀 2. MIGRATED FROM MONGOOSE: Query PostgreSQL using Prisma
    // Relational filters map directly to structured objects
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: hashedToken,
        verificationTokenExpires: {
          gt: new Date(), // Finds rows where expiration date is greater than right now
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired verification link." },
        { status: 400 }
      );
    }

    // 🚀 3. MIGRATED FROM MONGOOSE: Persist updates safely via Prisma
    // Instead of MongoDB's $set and $unset, we pass fields as data values
    // Setting optional columns to `null` handles the 'unset' operation natively in SQL
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationTokenExpires: null,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(new URL("/login?verified=true", baseUrl));

  } catch (error: unknown) {
    console.error("Verification Error:", error);

    return NextResponse.json(
      { error: "An unexpected error occurred during verification" },
      { status: 500 }
    );
  }
}
