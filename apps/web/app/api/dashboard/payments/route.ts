import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@repo/db"
import { getAuthenticatedSession } from "@/lib/auth/session"

export async function GET(request: NextRequest) {
  try {
    // --------------------------------------------------
    // 1. Authenticate user
    // --------------------------------------------------

    const auth = await getAuthenticatedSession(request)

    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // --------------------------------------------------
    // 2. Query parameters
    // --------------------------------------------------

    const { searchParams } = new URL(request.url)

    const page = Math.max(Number(searchParams.get("page")) || 1, 1)

    const limit = Math.min(
      Math.max(Number(searchParams.get("limit")) || 10, 1),
      100
    )

    const search = searchParams.get("search")?.trim() || ""

    const status = searchParams.get("status") || undefined

    const provider = searchParams.get("provider") || undefined

    const currency = searchParams.get("currency") || undefined

    const skip = (page - 1) * limit

    // --------------------------------------------------
    // 3. Build filters
    // --------------------------------------------------

    const where = {
      invoice: {
        userId: auth.userId,
      },

      ...(status
        ? {
            status: status as
              | "PENDING"
              | "PROCESSING"
              | "SUCCESS"
              | "FAILED"
              | "CANCELLED"
              | "EXPIRED",
          }
        : {}),

      ...(provider
        ? {
            provider: provider as "STRIPE" | "PAYSTACK" | "FLUTTERWAVE",
          }
        : {}),

      ...(currency
        ? {
            currency,
          }
        : {}),

      ...(search
        ? {
            OR: [
              {
                reference: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                providerReference: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                invoice: {
                  invoiceNumber: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
              },
              {
                invoice: {
                  customer: {
                    name: {
                      contains: search,
                      mode: "insensitive" as const,
                    },
                  },
                },
              },
              {
                invoice: {
                  customer: {
                    email: {
                      contains: search,
                      mode: "insensitive" as const,
                    },
                  },
                },
              },
            ],
          }
        : {}),
    }

    // --------------------------------------------------
    // 4. Fetch payments + total
    // --------------------------------------------------

    const [payments, total] = await prisma.$transaction([
      prisma.payment.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,

        include: {
          invoice: {
            select: {
              id: true,
              invoiceNumber: true,

              customer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      }),

      prisma.payment.count({
        where,
      }),
    ])

    // --------------------------------------------------
    // 5. Pagination
    // --------------------------------------------------

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    })
  } catch (error) {
    console.error("Get Payments Error:", error)

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch payments",
      },
      { status: 500 }
    )
  }
}
