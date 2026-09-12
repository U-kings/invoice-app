import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@repo/db"

import { encryptSecret } from "@/lib/security/encryption"
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
    const body = await request.json()

    const secretKey =
      typeof body.secretKey === "string" ? body.secretKey.trim() : ""

    if (!secretKey) {
      return NextResponse.json(
        { error: "Paystack secret key is required" },
        { status: 400 }
      )
    }

    if (
      !secretKey.startsWith("sk_test_") &&
      !secretKey.startsWith("sk_live_")
    ) {
      return NextResponse.json(
        { error: "Invalid Paystack secret key" },
        { status: 400 }
      )
    }

    const paystackResponse = await fetch(
      "https://api.paystack.co/integration/payment_session_timeout",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      }
    )

    if (!paystackResponse.ok) {
      return NextResponse.json(
        { error: "Unable to verify your Paystack credentials" },
        { status: 400 }
      )
    }

    const encryptedSecretKey = encryptSecret(secretKey)

    const connection = await prisma.paymentProviderConnection.upsert({
      where: {
        userId_provider: {
          userId: auth.userId,
          provider: "PAYSTACK",
        },
      },
      create: {
        userId: auth.userId,
        provider: "PAYSTACK",
        status: "CONNECTED",
        encryptedSecretKey,
      },
      update: {
        status: "CONNECTED",
        encryptedSecretKey,
        accessToken: null,
        refreshToken: null,
        tokenExpiresAt: null,
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

    return NextResponse.json(connection)
  } catch (error) {
    console.error("Failed to connect Paystack:", error)

    return NextResponse.json(
      { error: "Failed to connect Paystack" },
      { status: 500 }
    )
  }
}
