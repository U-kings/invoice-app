import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@repo/db"
import { getAuthenticatedSession } from "@/lib/auth/session"

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedSession(request)

    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const subscription = await prisma.subscription.upsert({
      where: {
        userId: auth.userId,
      },
      create: {
        userId: auth.userId,
        plan: "FREE",
        status: "ACTIVE",
      },
      update: {},
    })

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        plan: subscription.plan,
        status: subscription.status,
        provider: subscription.provider,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        cancelledAt: subscription.cancelledAt,
      },
    })
  } catch (error) {
    console.error("Billing GET error:", error)

    return NextResponse.json(
      { error: "Failed to fetch billing information" },
      { status: 500 }
    )
  }
}
