import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db"; // 🚀 1. Import your newly configured Prisma 7 client
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { email, password } = await req.json();

    // 1. Basic structural string check
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // 2. MIGRATED FROM MONGOOSE: Query user profile with Prisma
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 400 }
      );
    }

    // 3. Compare passwords safely using bcryptjs
    const isMatch: boolean = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 400 }
      );
    }

    // 4. Enforce Account Verification check
    if (!user.isVerified) {
      return NextResponse.json(
        {
          error: "Your account is not verified yet. Please check your email to verify your account.",
          requiresVerification: true,
        },
        { status: 403 }
      );
    }

    // 5. Verify the existence of secret environment keys before execution
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error(
        "JWT_SECRET environment variable is missing from configuration."
      );
    }

    // 6. Sign JWT using your PostgreSQL string ID field reference (`user.id` instead of `user._id`)
    const token: string = jwt.sign(
      {
        userId: user.id, // 💡 PostgreSQL uses plain string id keys instead of Mongo's object _id
        role: user.role,
        class: user.class,
      },
      jwtSecret,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({ message: "Login successful" });

    // 7. Secure cookie formulation
    response.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (err: unknown) {
    console.error("Login Route Error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "An unexpected server error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
