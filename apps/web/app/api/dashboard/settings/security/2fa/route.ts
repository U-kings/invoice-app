import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@repo/db"
import { getAuthenticatedSession } from "@/lib/auth/session"

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedSession(request)

    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const twoFactor = await prisma.userTwoFactor.findUnique({
      where: {
        userId: auth.userId,
      },
      select: {
        enabled: true,
      },
    })

    return NextResponse.json({
      enabled: twoFactor?.enabled ?? false,
    })
  } catch (error) {
    console.error("2FA status error:", error)

    return NextResponse.json(
      { error: "Failed to fetch two-factor authentication status" },
      { status: 500 }
    )
  }
}
