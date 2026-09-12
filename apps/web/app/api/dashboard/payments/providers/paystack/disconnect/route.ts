import { NextRequest, NextResponse } from "next/server"
import { Prisma, prisma } from "@repo/db"
import { getAuthenticatedSession } from "@/lib/auth/session"

interface JwtPayload {
  userId: string
  role?: string
  class?: string
}

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedSession(request)

  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    await prisma.paymentProviderConnection.updateMany({
      where: {
        userId: auth.userId,
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
