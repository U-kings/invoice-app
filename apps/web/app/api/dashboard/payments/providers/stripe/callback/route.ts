import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

import { prisma } from "@repo/db"
import { getAuthenticatedSession } from "@/lib/auth/session"

export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedSession(request)

  // if (!auth) {
  //   return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  // }

  if (!auth?.userId) {
    return NextResponse.redirect(new URL("/login", request.url))
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
      console.error(
        "[Stripe Connect] No Stripe account found for user:",
        auth.userId
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
          userId: auth.userId,
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
