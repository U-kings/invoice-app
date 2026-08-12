import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@repo/db"; // Adjust this path to match your Prisma client location

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    // 1. Basic presence and parameter validation checks
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing password reset token." },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    // 2. Fetch the user matching this specific token
    const user = await prisma.user.findUnique({
      where: { resetToken: token },
    });

    // 3. Security Checks: Verify token exists and is still valid
    if (!user || !user.resetTokenExpires) {
      return NextResponse.json(
        { success: false, error: "The link is invalid or has already been used." },
        { status: 400 }
      );
    }

    const isTokenExpired = new Date() > new Date(user.resetTokenExpires);
    if (isTokenExpired) {
      return NextResponse.json(
        { success: false, error: "This password reset link has expired. Please request a new one." },
        { status: 400 }
      );
    }

 // user.password is the encrypted bcrypt hash currently stored in your database
    const isSamePassword = await bcrypt.compare(newPassword, user.password)
    
    if (isSamePassword) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Your new password cannot be the same as your current password. Please choose a different one." 
        },
        { status: 400 }
      )
    }

    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // This prevents the same token from being used multiple times
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedNewPassword,
        resetToken: null,        // 👈 Explicitly clear the token
        resetTokenExpires: null, // 👈 Explicitly clear the expiration date
      },
    });

    return NextResponse.json({
      success: true,
      message: "Your password has been reset successfully. You can now log in.",
    });

  } catch (error: unknown) {
    console.error("RESET_PASSWORD_API_ERROR:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected internal server error occurred." },
      { status: 500 }
    );
  }
}
