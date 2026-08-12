import { NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@repo/db" // Your explicit monorepo Prisma Client instance
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    // 1. Safe Body Parser: Prevents crashes if body is missing or unreadable
    const body = await request.json().catch(() => ({}));
    const email = body?.email;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      )
    }

    const cleanEmail = email.toLowerCase().trim()

    // 2. Look up the user by email
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    })

    // 3. User Enumeration Protection: Return success message if email isn't registered
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If that email exists, a reset link has been sent.",
      })
    }

    // 4. Generate a unique cryptographic 64-character reset token
    const token = crypto.randomBytes(32).toString("hex")

    // 5. Set expiration limit to 1 hour from the current execution time
    const expiryDate = new Date()
    expiryDate.setHours(expiryDate.getHours() + 1)

    // 6. Save token and expiry into your live Supabase database
    // FIX: Changed 'resetTokenExpiry' to match your schema's 'resetTokenExpires'
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpires: expiryDate, // 👈 Matched to schema
      },
    })

    // 7. Assemble the reset landing page URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const resetUrl = `${baseUrl}/reset-password?token=${token}`

    const fromEmail = "Acme <onboarding@resend.dev>"

    // 8. Trigger automated transactional mail delivery via Resend API
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [cleanEmail],
      subject: "Reset Your Invoicing App Password",
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #111827; margin-bottom: 16px;">Password Reset Request</h2>
          <p style="color: #4b5563; line-height: 24px;">Hello ${user.firstName || "there"},</p>
          <p style="color: #4b5563; line-height: 24px;">We received a request to reset your invoicing app account password. Click the secure action button below to create a new password:</p>
          <div style="margin: 24px 0;">
            <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #6b7280; font-size: 14px; line-height: 20px;">This secure link is time-sensitive and will expire in 1 hour. If you did not make this request, you can safely ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 12px;">If the button above isn't working, copy and paste this URL into your browser:</p>
          <p style="color: #2563eb; font-size: 12px; word-break: break-all;">${resetUrl}</p>
        </div>
      `,
    })

    if (error) {
      console.error("RESEND_DELIVERY_ERROR:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to send reset email. Please try again later.",
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "If that email exists, a reset link has been sent.",
    })
  } catch (error: any) {
    console.error("FORGOT_PASSWORD_GLOBAL_ERROR:", error)
    return NextResponse.json(
      { success: false, error: error?.message || String(error) },
      // { success: false, error: "An unexpected internal server error occurred." },
      { status: 500 }
    )
  }
}
