import { NextRequest } from "next/server"
import jwt from "jsonwebtoken"

import { prisma } from "@repo/db"

type AuthToken = {
  userId: string
  role?: string
  class?: string
  sessionId: string
}

export async function getAuthenticatedSession(
  request: NextRequest
) {
  const token = request.cookies.get("token")?.value

  if (!token) {
    return null
  }

  const jwtSecret = process.env.JWT_SECRET

  if (!jwtSecret) {
    console.error("JWT_SECRET environment variable is missing")
    return null
  }

  try {
    const decoded = jwt.verify(
      token,
      jwtSecret
    ) as AuthToken

    if (!decoded.userId || !decoded.sessionId) {
      return null
    }

    const session = await prisma.session.findFirst({
      where: {
        id: decoded.sessionId,
        userId: decoded.userId,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    })

    if (!session) {
      return null
    }

    const fiveMinutesAgo = new Date(
      Date.now() - 5 * 60 * 1000
    )

    if (session.lastActiveAt < fiveMinutesAgo) {
      await prisma.session.update({
        where: {
          id: session.id,
        },
        data: {
          lastActiveAt: new Date(),
        },
      })
    }

    return {
      userId: decoded.userId,
      role: decoded.role,
      class: decoded.class,
      session,
    }
  } catch (error) {
    console.error("Authentication error:", error)
    return null
  }
}