import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@repo/db"
import { getAuthenticatedSession } from "@/lib/auth/session"

const FREE_INVOICE_LIMIT = 5

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthenticatedSession(request)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const subscription = await prisma.subscription.findUnique({
      where: {
        userId: session.userId,
      },
      select: {
        plan: true,
        status: true,
      },
    })

    const isPro =
      subscription?.plan === "PRO" &&
      subscription.status === "ACTIVE"

    if (isPro) {
      return NextResponse.json({
        plan: "PRO",
        isPro: true,
        usage: {
          count: null,
          limit: null,
          remaining: null,
          percentage: 0,
        },
      })
    }

    const now = new Date()

    const monthStart = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        1,
        0,
        0,
        0,
        0
      )
    )

    const nextMonthStart = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth() + 1,
        1,
        0,
        0,
        0,
        0
      )
    )

    const count = await prisma.invoice.count({
      where: {
        userId: session.userId,
        createdAt: {
          gte: monthStart,
          lt: nextMonthStart,
        },
      },
    })

    const remaining = Math.max(
      0,
      FREE_INVOICE_LIMIT - count
    )

    const percentage = Math.min(
      100,
      Math.round(
        (count / FREE_INVOICE_LIMIT) * 100
      )
    )

    return NextResponse.json({
      plan: "FREE",
      isPro: false,
      usage: {
        count,
        limit: FREE_INVOICE_LIMIT,
        remaining,
        percentage,
      },
    })
  } catch (error) {
    console.error(
      "Get invoice usage error:",
      error
    )

    return NextResponse.json(
      {
        error: "Unable to load invoice usage.",
      },
      { status: 500 }
    )
  }
}