import { NextRequest, NextResponse } from "next/server"
import { randomBytes } from "node:crypto"
import bcrypt from "bcryptjs"

import { prisma } from "@repo/db"
import { resend } from "@/lib/email/resend"
import { confirmEmailChangeTemplate } from "@/lib/email/templates/confirm-email-change"
import { getAuthenticatedSession } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedSession(request)

    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()

    const newEmail =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : ""

    const currentPassword =
      typeof body.currentPassword === "string" ? body.currentPassword : ""

    if (!newEmail) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      return NextResponse.json(
        { error: "Enter a valid email address" },
        { status: 400 }
      )
    }

    if (!currentPassword) {
      return NextResponse.json(
        { error: "Current password is required" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: {
        id: auth.userId,
      },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!user.password) {
      return NextResponse.json(
        {
          error: "Password authentication is not available for this account",
        },
        { status: 400 }
      )
    }

    if (newEmail === user.email.toLowerCase()) {
      return NextResponse.json(
        {
          error: "The new email address is the same as your current email",
        },
        { status: 400 }
      )
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: newEmail,
      },
      select: {
        id: true,
      },
    })

    if (existingUser && existingUser.id !== user.id) {
      return NextResponse.json(
        { error: "That email address is already in use" },
        { status: 409 }
      )
    }

    const emailChangeToken = randomBytes(32).toString("hex")

    const emailChangeTokenExpires = new Date(Date.now() + 30 * 60 * 1000)

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        pendingEmail: newEmail,
        emailChangeToken,
        emailChangeTokenExpires,
      },
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    const verificationUrl =
      `${appUrl}/api/dashboard/settings/profile/email/verify` +
      `?token=${encodeURIComponent(emailChangeToken)}`

    const { error } = await resend.emails.send({
      from: "Invoice Flow <onboarding@resend.dev>",
      to: newEmail,
      subject: "Confirm your new email address",
      html: confirmEmailChangeTemplate({
        firstName: user.firstName,
        newEmail,
        verificationUrl,
      }),
    })

    if (error) {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          pendingEmail: null,
          emailChangeToken: null,
          emailChangeTokenExpires: null,
        },
      })

      console.error("Email change email error:", error)

      return NextResponse.json(
        { error: "Failed to send confirmation email" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message:
        "Confirmation email sent. Check your new email address to complete the change.",
    })
  } catch (error) {
    console.error("Email change request error:", error)

    return NextResponse.json(
      { error: "Failed to request email change" },
      { status: 500 }
    )
  }
}
