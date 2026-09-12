import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"

import { prisma } from "@repo/db"
import {
  generateRecoveryCodes,
  verifyTwoFactorToken,
} from "@/lib/auth/two-factor"
import { getAuthenticatedSession } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedSession(request)

    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()

    const code = typeof body.code === "string" ? body.code.trim() : ""

    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: "Enter a valid 6-digit verification code" },
        { status: 400 }
      )
    }

    const twoFactor = await prisma.userTwoFactor.findUnique({
      where: {
        userId: auth.userId,
      },
    })

    if (!twoFactor) {
      return NextResponse.json(
        { error: "Two-factor authentication setup has not been started" },
        { status: 400 }
      )
    }

    if (twoFactor.enabled) {
      return NextResponse.json(
        { error: "Two-factor authentication is already enabled" },
        { status: 400 }
      )
    }

    if (!twoFactor.secret) {
      return NextResponse.json(
        { error: "Two-factor authentication setup is not available" },
        { status: 400 }
      )
    }

    const isValid = await verifyTwoFactorToken(twoFactor.secret, code)

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      )
    }

    const recoveryCodes = generateRecoveryCodes(8)

    const hashedRecoveryCodes = await Promise.all(
      recoveryCodes.map((recoveryCode) => bcrypt.hash(recoveryCode, 12))
    )

    await prisma.userTwoFactor.update({
      where: {
        userId: auth.userId,
      },
      data: {
        enabled: true,
        recoveryCodes: hashedRecoveryCodes,
      },
    })

    return NextResponse.json({
      message: "Two-factor authentication enabled successfully",
      recoveryCodes,
    })
  } catch (error) {
    console.error("2FA verification error:", error)

    return NextResponse.json(
      {
        error: "Failed to verify two-factor authentication",
      },
      { status: 500 }
    )
  }
}
