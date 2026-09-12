import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

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
    const connection = await prisma.paymentProviderConnection.findUnique({
      where: {
        userId_provider: {
          userId: auth.userId,
          provider: "STRIPE",
        },
      },
    })

    if (!connection?.providerAccountId) {
      return NextResponse.json(
        { error: "Stripe is not connected" },
        { status: 404 }
      )
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

    await stripe.accounts.del(connection.providerAccountId)

    await prisma.paymentProviderConnection.update({
      where: {
        id: connection.id,
      },
      data: {
        status: "DISCONNECTED",
        providerAccountId: null,
        accessToken: null,
        refreshToken: null,
        tokenExpiresAt: null,
        metadata: Prisma.DbNull,
      },
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error("Failed to disconnect Stripe:", error)

    return NextResponse.json(
      {
        error: "Failed to disconnect Stripe",
      },
      { status: 500 }
    )
  }
}
