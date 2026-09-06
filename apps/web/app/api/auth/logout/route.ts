import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@repo/db"
import { getAuthenticatedSession } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedSession(request)

    if (auth) {
      await prisma.session.update({
        where: {
          id: auth.session.id,
        },
        data: {
          revokedAt: new Date(),
        },
      })
    }
  } catch (error) {
    console.error("Logout session cleanup error:", error)
  }

  const response = NextResponse.json(
    {
      message: "Logged out successfully",
    },
    {
      status: 200,
    },
  )

  response.cookies.set("token", "", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
  })

  return response
}