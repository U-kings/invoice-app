import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@repo/db"
import { getAuthenticatedSession } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedSession(request)

    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      )
    }

    const result = await prisma.session.updateMany({
      where: {
        userId: auth.userId,
        id: {
          not: auth.session.id,
        },
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: "You have been signed out of all other devices.",
      revokedCount: result.count,
    })
  } catch (error) {
    console.error("Revoke all sessions error:", error)

    return NextResponse.json(
      { error: "Failed to sign out of other devices" },
      { status: 500 },
    )
  }
}