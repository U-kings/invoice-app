import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

import { prisma } from "@repo/db"
import { generateRecoveryCodes } from "@/lib/auth/two-factor"
import { getAuthenticatedSession } from "@/lib/auth/session"

// 1. GET: Check status of recovery codes (Since they are hashed, we can't show them)
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedSession(request)

    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }
    const twoFactor = await prisma.userTwoFactor.findUnique({
      where: { userId: auth.userId },
      select: {
        enabled: true,
        recoveryCodes: true,
      },
    })

    if (!twoFactor || !twoFactor.enabled) {
      return NextResponse.json(
        { error: "Two-factor authentication is not enabled" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      hasRecoveryCodes: twoFactor.recoveryCodes.length > 0,
      count: twoFactor.recoveryCodes.length,
    })
  } catch (error) {
    console.error("Fetch recovery codes error:", error)
    return NextResponse.json(
      { error: "Failed to fetch recovery codes status" },
      { status: 500 }
    )
  }
}

// 2. POST: Regenerate and hash a fresh set of recovery codes
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string
    }

    const twoFactor = await prisma.userTwoFactor.findUnique({
      where: { userId: decoded.userId },
      select: { enabled: true },
    })

    if (!twoFactor || !twoFactor.enabled) {
      return NextResponse.json(
        {
          error:
            "Two-factor authentication must be enabled to generate recovery codes",
        },
        { status: 400 }
      )
    }

    // Generate 8 new plain text codes from your utility
    const recoveryCodes = generateRecoveryCodes(8)

    // Hash them exactly like your verify setup route
    const hashedRecoveryCodes = await Promise.all(
      recoveryCodes.map((recoveryCode) => bcrypt.hash(recoveryCode, 12))
    )

    // Overwrite old codes with the new hashed set
    await prisma.userTwoFactor.update({
      where: { userId: decoded.userId },
      data: {
        recoveryCodes: hashedRecoveryCodes,
      },
    })

    // Return the plain text ones ONLY once so the user can download/copy them
    return NextResponse.json({
      message: "Recovery codes successfully regenerated",
      recoveryCodes,
    })
  } catch (error) {
    console.error("Regenerate recovery codes error:", error)
    return NextResponse.json(
      { error: "Failed to regenerate recovery codes" },
      { status: 500 }
    )
  }
}
