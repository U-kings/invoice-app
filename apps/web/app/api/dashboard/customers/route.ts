import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

import { prisma } from "@repo/db"

interface AuthPayload {
  userId: string
}

import { CustomerStatus as PrismaCustomerStatus } from "@repo/db"
import { getAuthenticatedSession } from "@/lib/auth/session"

const statusMap: Record<string, PrismaCustomerStatus> = {
  Active: "ACTIVE",
  Archived: "ARCHIVED",
  Blocked: "BLOCKED",
}

export async function GET(request: NextRequest) {
  try {
const auth = await getAuthenticatedSession(request)

    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      )
    }
    // ---------------------------------------------
    // 2. Read query parameters
    // ---------------------------------------------

    const searchParams = request.nextUrl.searchParams

    const search = searchParams.get("search")?.trim() ?? ""

    const status = searchParams.get("status")?.trim() || ""

    const pageParam = Number(searchParams.get("page") ?? "1")

    const limitParam = Number(searchParams.get("pageSize") ?? "10")

    const page =
      Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1

    const limit =
      Number.isFinite(limitParam) && limitParam > 0
        ? Math.min(Math.floor(limitParam), 100)
        : 10

    const skip = (page - 1) * limit

    let statusFilter: PrismaCustomerStatus | undefined

    if (status) {
      statusFilter = statusMap[status]

      if (!statusFilter) {
        return NextResponse.json(
          {
            error: "Invalid invoice status",
          },
          {
            status: 400,
          }
        )
      }
    }

    // ---------------------------------------------
    // 3. Build search condition
    // ---------------------------------------------

    const where = {
      userId: auth.userId,

      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                email: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                id: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
      ...(statusFilter
        ? {
            status: statusFilter,
          }
        : {}),
    }

    // ---------------------------------------------
    // 4. Get customers + total count
    // ---------------------------------------------

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,

        orderBy: {
          createdAt: "desc",
        },

        skip,
        take: limit,

        include: {
          _count: {
            select: {
              invoices: true,
            },
          },

          invoices: {
            select: {
              currency: true,
              lineItems: {
                select: {
                  quantity: true,
                  rate: true,
                },
              },
            },
          },
        },
      }),

      prisma.customer.count({
        where,
      }),
    ])

    // ---------------------------------------------
    // 5. Calculate customer totals
    // ---------------------------------------------

    const data = customers.map((customer) => {
      const totalsByCurrency = customer.invoices.reduce(
        (totals, invoice) => {
          const total = invoice.lineItems.reduce(
            (sum, item) => sum + Number(item.quantity) * Number(item.rate),
            0
          )

          totals[invoice.currency] = (totals[invoice.currency] ?? 0) + total

          return totals
        },
        {} as Record<string, number>
      )

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        status: customer.status,
        createdAt: customer.createdAt,
        invoiceCount: customer._count.invoices,
        totalsByCurrency,
      }
    })

    // ---------------------------------------------
    // 6. Pagination metadata
    // ---------------------------------------------

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      customers: data,

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
    console.error("Get Customers Error:", error)

    // Check if the database connection was dropped due to network issues
    if (
      error instanceof Error &&
      error.message.includes("closed the connection")
    ) {
      console.log(
        "Network drop detected. Forcing Prisma client reconnection..."
      )
      await prisma.$disconnect().catch(() => {}) // Safely clear dead connections
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch customers",
      },
      { status: 500 }
    )
  }
}

interface CreateCustomerBody {
  name: string
  email: string
}

export async function POST(request: NextRequest) {
  try {
    // ---------------------------------------------
    // 1. Authenticate user
    // ---------------------------------------------

    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const jwtSecret = process.env.JWT_SECRET

    if (!jwtSecret) {
      throw new Error("JWT_SECRET environment variable is missing")
    }

    let decoded: AuthPayload

    try {
      decoded = jwt.verify(token, jwtSecret) as AuthPayload
    } catch {
      return NextResponse.json(
        {
          error: "Invalid or expired authentication token",
        },
        { status: 401 }
      )
    }

    if (!decoded.userId) {
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      )
    }

    // ---------------------------------------------
    // 2. Parse body
    // ---------------------------------------------

    const body = (await request.json()) as CreateCustomerBody

    const name = body.name?.trim()
    const email = body.email?.trim().toLowerCase()

    // ---------------------------------------------
    // 3. Validate
    // ---------------------------------------------

    if (!name) {
      return NextResponse.json(
        { error: "Customer name is required" },
        { status: 400 }
      )
    }

    if (!email) {
      return NextResponse.json(
        { error: "Customer email is required" },
        { status: 400 }
      )
    }

    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

    if (!emailIsValid) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      )
    }

    // ---------------------------------------------
    // 4. Prevent duplicate customer
    // ---------------------------------------------

    const existingCustomer = await prisma.customer.findFirst({
      where: {
        userId: decoded.userId,
        email,
      },
    })

    if (existingCustomer) {
      return NextResponse.json(
        {
          error: "A customer with this email already exists",
        },
        { status: 409 }
      )
    }

    // ---------------------------------------------
    // 5. Create customer
    // ---------------------------------------------
    console.error(decoded.userId)
    const customer = await prisma.customer.create({
      data: {
        userId: decoded.userId,
        name,
        email,
      },
    })

    // ---------------------------------------------
    // 6. Return customer
    // ---------------------------------------------

    return NextResponse.json(
      {
        message: "Customer created successfully",
        customer,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Create Customer Error:", error)

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create customer",
      },
      { status: 500 }
    )
  }
}
