import { prisma } from "@repo/db"; // 🚀 Import your newly configured Prisma 7 client
import { sendVerificationEmail } from "@/lib/email"; // Keep your existing helper mapping
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const {
      firstName,
      middleName,
      lastName,
      class: userClass,
      email,
      phoneNumber,
      password,
      confirmPassword,
      terms,
    } = await req.json();

    // 1. Validation Guards
    if (!terms || terms === "false" || terms === false) {
      return NextResponse.json(
        { error: "You must accept the terms and conditions." },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match." },
        { status: 400 }
      );
    }

    // 2. MIGRATED FROM MONGOOSE: Check unique record with Prisma
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // 3. Security hashing
    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString("hex");
    
    // Convert 1 hour timestamp offset safely into a valid JavaScript Date Object for PostgreSQL
    const verificationTokenExpires = new Date(Date.now() + 3600000); 

    const hashedToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    // 4. MIGRATED FROM MONGOOSE: Insert data payload via Prisma
    const user = await prisma.user.create({
      data: {
        firstName,
        middleName: middleName || null,
        lastName,
        class: userClass || "Default",
        email: email.toLowerCase(),
        phoneNumber,
        password: hashedPassword,
        terms: Boolean(terms),
        verificationToken: hashedToken,
        verificationTokenExpires,
      },
    });

    console.log("Created user with Prisma:", user);

    // 5. Build dynamic communication link details
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${verificationToken}`;

    // Fire email helper using database property contexts
    await sendVerificationEmail({
      to: user.email,
      firstName: user.firstName,
      verificationUrl: verificationUrl,
    });

    // 6. Return unified Next.js NextResponse object format to fix your previous route configuration crashes
    return NextResponse.json(
      {
        message: "Registration successful! Please check your email to verify your account.",
      },
      { status: 201 }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Failed registration lifecycle:", errorMessage);

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
