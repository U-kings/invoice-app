import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { Prisma, prisma } from "@repo/db"

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

export async function POST(request: NextRequest) {
  const userId = getUserId(request)

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await prisma.paymentProviderConnection.updateMany({
      where: {
        userId,
        provider: "PAYSTACK",
      },
      data: {
        status: "DISCONNECTED",
        encryptedSecretKey: null,
        accessToken: null,
        refreshToken: null,
        tokenExpiresAt: null,
        providerAccountId: null,
        providerMerchantId: null,
        metadata: Prisma.DbNull,
      },
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error("Failed to disconnect Paystack:", error)

    return NextResponse.json(
      { error: "Failed to disconnect Paystack" },
      { status: 500 }
    )
  }
}
