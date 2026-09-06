import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@repo/db"
import { getAuthenticatedSession } from "@/lib/auth/session"

type RouteContext = {
  params: Promise<{
    sessionId: string
  }>
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const auth = await getAuthenticatedSession(request)

    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      )
    }

    const { sessionId } = await context.params

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 },
      )
    }

    // Prevent the user from accidentally revoking
    // the session they are currently using.
    if (sessionId === auth.session.id) {
      return NextResponse.json(
        {
          error:
            "You cannot sign out of your current session from here.",
        },
        { status: 400 },
      )
    }

    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        userId: auth.userId,
        revokedAt: null,
      },
      select: {
        id: true,
      },
    })

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 },
      )
    }

    await prisma.session.update({
      where: {
        id: session.id,
      },
      data: {
        revokedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: "The session has been signed out.",
    })
  } catch (error) {
    console.error("Revoke session error:", error)

    return NextResponse.json(
      { error: "Failed to sign out of this session" },
      { status: 500 },
    )
  }
}