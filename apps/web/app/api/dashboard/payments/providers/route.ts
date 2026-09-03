import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

import { prisma } from "@repo/db"

interface JwtPayload {
  userId: string
  role?: string
  class?: string
}

function getUserId(request: NextRequest) {
  const token = request.cookies.get("token")?.value

  if (!token) {
    return null
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload

    return decoded.userId ?? null
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const userId = getUserId(request)

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const connections = await prisma.paymentProviderConnection.findMany({
      where: {
        userId,
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
