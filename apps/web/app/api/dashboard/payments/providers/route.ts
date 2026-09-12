import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@repo/db"
import { getAuthenticatedSession } from "@/lib/auth/session"

interface JwtPayload {
  userId: string
  role?: string
  class?: string
}

export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedSession(request)

  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const connections = await prisma.paymentProviderConnection.findMany({
      where: {
        userId: auth.userId,
      },
      select: {
        id: true,
        provider: true,
        status: true,
        providerAccountId: true,
        providerMerchantId: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(connections)
  } catch (error) {
    console.error("Failed to fetch payment provider connections:", error)

    return NextResponse.json(
      {
        error: "Failed to fetch payment provider connections",
      },
      { status: 500 }
    )
  }
}
