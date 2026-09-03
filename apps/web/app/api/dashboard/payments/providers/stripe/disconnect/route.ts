import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import Stripe from "stripe"

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
    const connection = await prisma.paymentProviderConnection.findUnique({
      where: {
        userId_provider: {
          userId,
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
