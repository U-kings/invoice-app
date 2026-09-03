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
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY

    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured")
    }
    const stripe = new Stripe(stripeSecretKey)

    const existingConnection =
      await prisma.paymentProviderConnection.findUnique({
        where: {
          userId_provider: {
            userId,
            provider: "STRIPE",
          },
        },
      })

    let accountId = existingConnection?.providerAccountId

    if (!accountId) {
      const businessProfile = await prisma.businessProfile.findUnique({
        where: {
          userId,
        },
      })

      const user = await prisma.user.findUnique({
        where: {
          id: userId,
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
            userId,
            provider: "STRIPE",
          },
        },
        create: {
          userId,
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
        userId,
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
