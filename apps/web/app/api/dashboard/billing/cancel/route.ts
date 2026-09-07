import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

import { prisma } from "@repo/db"

type AuthPayload = {
  userId: string
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      )
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as AuthPayload

    const subscription =
      await prisma.subscription.findUnique({
        where: {
          userId: decoded.userId,
        },
      })

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 },
      )
    }

    if (subscription.plan === "FREE") {
      return NextResponse.json(
        { error: "You do not have an active Pro subscription" },
        { status: 400 },
      )
    }

    if (subscription.cancelAtPeriodEnd) {
      return NextResponse.json(
        { error: "Subscription is already scheduled for cancellation" },
        { status: 400 },
      )
    }

    const updatedSubscription =
      await prisma.subscription.update({
        where: {
          userId: decoded.userId,
        },
        data: {
          cancelAtPeriodEnd: true,
          cancelledAt: new Date(),
        },
      })

    return NextResponse.json({
      message:
        "Your subscription has been scheduled for cancellation",
      subscription: {
        plan: updatedSubscription.plan,
        status: updatedSubscription.status,
        currentPeriodEnd:
          updatedSubscription.currentPeriodEnd,
        cancelAtPeriodEnd:
          updatedSubscription.cancelAtPeriodEnd,
      },
    })
  } catch (error) {
    console.error("Billing cancellation error:", error)

    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 },
    )
  }
}