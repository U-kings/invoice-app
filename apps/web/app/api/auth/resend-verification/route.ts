import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const { email } = await req.json();

    // 1. Basic structural payload check
    if (!email) {
      return NextResponse.json({ error: "Email address is required." }, { status: 400 });
    }

    // 2. Find user profile in database
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Security Tip: If email doesn't exist, return a 200 success message anyway.
    // This prevents malicious actors from checking which emails are registered on your site.
    if (!user) {
      return NextResponse.json(
        { message: "If this email is registered, a new verification link has been sent." },
        { status: 200 }
      );
    }

    // 3. If user is already verified, inform them immediately
    if (user.isVerified) {
      return NextResponse.json(
        { error: "This account is already verified. You can log in." },
        { status: 400 }
      );
    }

    // 4. Generate a brand new secure token
    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpires = new Date(Date.now() + 3600000); // Fresh 1 hour window

    // Securely hash the token for database storage
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // 5. Update the user document fields with new token metrics
    user.verificationToken = hashedToken;
    user.verificationTokenExpires = tokenExpires;
    await user.save();

    // 6. Build the fresh callback verification link
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verificationUrl = `${appUrl}/api/verify-email?token=${token}`;

    // 7. Dispatch the fresh layout via Resend
    await sendVerificationEmail({
      to: user.email,
      firstName: user.firstName,
      verificationUrl: verificationUrl,
    });

    return NextResponse.json(
      { message: "If this email is registered, a new verification link has been sent." },
      { status: 200 }
    );

  } catch (err: unknown) {
    console.error("Resend Link Route Error:", err);
    const errorMessage = err instanceof Error ? err.message : "An unexpected server error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
