import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { prisma } from "@repo/db"
import { getAuthenticatedSession } from "@/lib/auth/session"

interface JwtPayload {
  userId: string
  role?: string
  class?: string
}

export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedSession(request)

  // if (!auth) {
  //   return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  // }

  if (!auth?.userId) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY

    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured")
    }
    const stripe = new Stripe(stripeSecretKey)

    const existingConnection =
      await prisma.paymentProviderConnection.findUnique({
        where: {
          userId_provider: {
            userId: auth.userId,
            provider: "STRIPE",
          },
        },
      })

    let accountId = existingConnection?.providerAccountId

    if (!accountId) {
      const businessProfile = await prisma.businessProfile.findUnique({
        where: {
          userId: auth.userId,
        },
      })

      const user = await prisma.user.findUnique({
        where: {
          id: auth.userId,
        },
        select: {
          email: true,
        },
      })

      const account = await stripe.accounts.create({
        type: "express",
        email: user?.email ?? businessProfile?.email ?? undefined,
        business_profile: {
          name: businessProfile?.businessName ?? undefined,
        },
      })

      accountId = account.id

      await prisma.paymentProviderConnection.upsert({
        where: {
          userId_provider: {
            userId: auth.userId,
            provider: "STRIPE",
          },
        },
        create: {
          userId: auth.userId,
          provider: "STRIPE",
          status: "PENDING",
          providerAccountId: accountId,
        },
        update: {
          status: "PENDING",
          providerAccountId: accountId,
        },
      })
    }

    const refreshUrl = process.env.STRIPE_CONNECT_REFRESH_URL
    const returnUrl = process.env.STRIPE_CONNECT_RETURN_URL

    if (!refreshUrl) {
      throw new Error("STRIPE_CONNECT_REFRESH_URL is not configured")
    }

    if (!returnUrl) {
      throw new Error("STRIPE_CONNECT_RETURN_URL is not configured")
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    })

    return NextResponse.redirect(accountLink.url)
  } catch (error) {
    console.error("Failed to start Stripe connection:", error)

    await prisma.paymentProviderConnection.updateMany({
      where: {
        userId: auth.userId,
        provider: "STRIPE",
      },
      data: {
        status: "ERROR",
      },
    })

    return NextResponse.redirect(
      new URL(
        "/dashboard/settings/payments?provider=stripe&status=error",
        request.url
      )
    )
  }
}
