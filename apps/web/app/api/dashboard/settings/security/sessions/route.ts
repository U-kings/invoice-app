import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@repo/db"
import { getAuthenticatedSession } from "@/lib/auth/session"
import { parseUserAgent } from "@/lib/auth/user-agent"

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedSession(request)

    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sessions = await prisma.session.findMany({
      where: {
        userId: auth.userId,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        lastActiveAt: "desc",
      },
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        lastActiveAt: true,
        expiresAt: true,
      },
    })

    return NextResponse.json({
      sessions: sessions.map((session) => {
        const device = parseUserAgent(session.userAgent)

        return {
          id: session.id,
          browser: device.browser,
          browserVersion: device.browserVersion,
          operatingSystem: device.operatingSystem,
          createdAt: session.createdAt,
          lastActiveAt: session.lastActiveAt,
          expiresAt: session.expiresAt,
          isCurrent: session.id === auth.session.id,
        }
      }),
    })
  } catch (error) {
    console.error("Fetch active sessions error:", error)

    return NextResponse.json(
      { error: "Failed to fetch active sessions" },
      { status: 500 }
    )
  }
}
