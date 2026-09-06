import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@repo/db"
import { getAuthenticatedSession } from "@/lib/auth/session"

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedSession(request)

    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: {
        id: auth.userId,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    const { password, ...publicUser } = user

    return NextResponse.json(
      {
        user: publicUser,

        // Keep this for your existing Zustand hydration.
        access_token: request.cookies.get("token")?.value ?? null,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Session verification route failure:", error)

    return NextResponse.json({ error: "Invalid session" }, { status: 401 })
  }
}
