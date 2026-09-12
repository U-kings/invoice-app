import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@repo/db"
import { getAuthenticatedSession } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedSession(request)

    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const subscription = await prisma.subscription.findUnique({
      where: {
        userId: auth.userId,
      },
    })

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      )
    }

    if (subscription.plan === "FREE") {
      return NextResponse.json(
        { error: "You do not have an active Pro subscription" },
        { status: 400 }
      )
    }

    if (subscription.cancelAtPeriodEnd) {
      return NextResponse.json(
        { error: "Subscription is already scheduled for cancellation" },
        { status: 400 }
      )
    }

    const updatedSubscription = await prisma.subscription.update({
      where: {
        userId: auth.userId,
      },
      data: {
        cancelAtPeriodEnd: true,
        cancelledAt: new Date(),
      },
    })

    return NextResponse.json({
      message: "Your subscription has been scheduled for cancellation",
      subscription: {
        plan: updatedSubscription.plan,
        status: updatedSubscription.status,
        currentPeriodEnd: updatedSubscription.currentPeriodEnd,
        cancelAtPeriodEnd: updatedSubscription.cancelAtPeriodEnd,
      },
    })
  } catch (error) {
    console.error("Billing cancellation error:", error)

    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    )
  }
}
