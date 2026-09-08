import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@repo/db"
import { getAuthenticatedSession } from "@/lib/auth/session"

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthenticatedSession(request)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)

    const page = Math.max(Number(searchParams.get("page")) || 1, 1)

    const pageSize = Math.min(
      Math.max(Number(searchParams.get("pageSize")) || 10, 1),
      50
    )

    const skip = (page - 1) * pageSize

    const [transactions, total] = await prisma.$transaction([
      prisma.billingTransaction.findMany({
        where: {
          userId: session.userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: pageSize,
        select: {
          id: true,
          provider: true,
          providerTransactionId: true,
          providerReference: true,
          amount: true,
          currency: true,
          status: true,
          description: true,
          paidAt: true,
          createdAt: true,
        },
      }),

      prisma.billingTransaction.count({
        where: {
          userId: session.userId,
        },
      }),
    ])

    return NextResponse.json({
      transactions: transactions.map((transaction) => ({
        id: transaction.id,
        provider: transaction.provider,
        providerTransactionId: transaction.providerTransactionId,
        providerReference: transaction.providerReference,
        amount: transaction.amount.toString(),
        currency: transaction.currency,
        status: transaction.status,
        description: transaction.description,
        paidAt: transaction.paidAt?.toISOString() ?? null,
        createdAt: transaction.createdAt.toISOString(),
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error("Get billing history error:", error)

    return NextResponse.json(
      {
        error: "Failed to fetch billing history",
      },
      { status: 500 }
    )
  }
}
