import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import Stripe from "stripe"

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
    return NextResponse.redirect(new URL("/login", request.url))
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
      console.error(
        "[Stripe Connect] No Stripe account found for user:",
        userId
      )

      return NextResponse.redirect(
        new URL(
          "/dashboard/settings/payments?provider=stripe&status=error",
          request.url
        )
      )
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY

    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured")
    }

    const stripe = new Stripe(stripeSecretKey)

    const account = await stripe.accounts.retrieve(connection.providerAccountId)

    const chargesEnabled = account.charges_enabled
    const payoutsEnabled = account.payouts_enabled
    const detailsSubmitted = account.details_submitted

    const connected = chargesEnabled && payoutsEnabled && detailsSubmitted

    console.log("[Stripe Connect] Account verification:", {
      accountId: connection.providerAccountId,
      chargesEnabled,
      payoutsEnabled,
      detailsSubmitted,
      connected,
    })

    await prisma.paymentProviderConnection.update({
      where: {
        id: connection.id,
      },
      data: {
        status: connected ? "CONNECTED" : "PENDING",
        metadata: {
          chargesEnabled,
          payoutsEnabled,
          detailsSubmitted,
        },
      },
    })

    return NextResponse.redirect(
      new URL(
        `/dashboard/settings/payments?provider=stripe&status=${
          connected ? "connected" : "pending"
        }`,
        request.url
      )
    )
  } catch (error) {
    console.error("[Stripe Connect] Failed to verify connection:", error)

    try {
      await prisma.paymentProviderConnection.updateMany({
        where: {
          userId,
          provider: "STRIPE",
        },
        data: {
          status: "ERROR",
        },
      })
    } catch (dbError) {
      console.error(
        "[Stripe Connect] Failed to update connection status:",
        dbError
      )
    }

    return NextResponse.redirect(
      new URL(
        "/dashboard/settings/payments?provider=stripe&status=error",
        request.url
      )
    )
  }
}
