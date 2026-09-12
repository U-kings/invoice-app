import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@repo/db"
import { getAuthenticatedSession } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedSession(request)

    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // 1. Fetch current 2FA status
    const userTwoFactor = await prisma.userTwoFactor.findUnique({
      where: {
        userId: auth.userId,
      },
    })

    // 2. Check if 2FA is already turned off or doesn't exist
    if (!userTwoFactor || !userTwoFactor.enabled) {
      return NextResponse.json(
        { error: "Two-factor authentication is not enabled" },
        { status: 400 }
      )
    }

    // 3. Disable 2FA by updating the record
    await prisma.userTwoFactor.update({
      where: {
        userId: auth.userId,
      },
      data: {
        enabled: false,
        secret: null, // Clear secret for security
        recoveryCodes: [], // Wipe old recovery codes
      },
    })

    return NextResponse.json({
      message: "Two-factor authentication has been successfully disabled.",
    })
  } catch (error) {
    console.error("2FA disable error:", error)

    return NextResponse.json(
      { error: "Failed to disable two-factor authentication" },
      { status: 500 }
    )
  }
}
