import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

import { prisma } from "@repo/db"
import { sendInvoice } from "@/lib/invoices/send-invoice"

interface AuthPayload {
  userId: string
}

interface CreateInvoiceItem {
  description: string
  quantity: number
  rate: number
}

interface CreateInvoiceBody {
  customerId: string
  currency: string
  issueDate: string
  dueDate: string
  paymentTerm?: string
  discount?: number
  taxRate?: number
  notes?: string
  status?: "DRAFT" | "SENT"
  send?: boolean
  items: CreateInvoiceItem[]
}

import { InvoiceStatus as PrismaInvoiceStatus } from "@repo/db"

const statusMap: Record<
  string,
  PrismaInvoiceStatus
> = {
  Sent: "SENT",
  Paid: "PAID",
  Overdue: "OVERDUE",
  Draft: "DRAFT",
  Cancelled: "CANCELLED",
}

export async function GET(req: NextRequest) {
  try {
    // ---------------------------------------------------------
    // 1. Get authentication token
    // ---------------------------------------------------------

    const token = req.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      )
    }

    // ---------------------------------------------------------
    // 2. Verify JWT
    // ---------------------------------------------------------

    const jwtSecret = process.env.JWT_SECRET

    if (!jwtSecret) {
      throw new Error(
        "JWT_SECRET environment variable is missing from configuration."
      )
    }

    let decoded: {
      userId: string
      role?: string
      class?: string
    }

    try {
      decoded = jwt.verify(
        token,
        jwtSecret
      ) as typeof decoded
    } catch {
      return NextResponse.json(
        {
          error: "Invalid or expired token",
        },
        {
          status: 401,
        }
      )
    }

    if (!decoded.userId) {
      return NextResponse.json(
        {
          error: "Invalid authentication token",
        },
        {
          status: 401,
        }
      )
    }

    // ---------------------------------------------------------
    // 3. Query parameters
    // ---------------------------------------------------------

    const { searchParams } = new URL(req.url)

    const search =
      searchParams.get("search")?.trim() || ""

    const status =
      searchParams.get("status")?.trim() || ""

    const page = Math.max(
      Number(searchParams.get("page")) || 1,
      1
    )

    const pageSize = Math.min(
      Math.max(
        Number(searchParams.get("pageSize")) || 10,
        1
      ),
      100
    )

    const skip =
      (page - 1) * pageSize

    // ---------------------------------------------------------
    // 4. Validate status
    // ---------------------------------------------------------

    let statusFilter:
      | PrismaInvoiceStatus
      | undefined

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

    // ---------------------------------------------------------
    // 5. Build WHERE clause
    // ---------------------------------------------------------

    const where = {
      userId: decoded.userId,

      ...(search
        ? {
            OR: [
              {
                invoiceNumber: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                customer: {
                  name: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
              },
              {
                customer: {
                  email: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
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

    // ---------------------------------------------------------
    // 6. Fetch invoices + count
    // ---------------------------------------------------------

    const [invoices, total] =
      await prisma.$transaction([
        prisma.invoice.findMany({
          where,
          include: {
            customer: true,
            lineItems: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          skip,
          take: pageSize,
        }),

        prisma.invoice.count({
          where,
        }),
      ])

    // ---------------------------------------------------------
    // 7. Pagination
    // ---------------------------------------------------------

    const totalPages = Math.ceil(
      total / pageSize
    )

    return NextResponse.json({
      data: invoices,

      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNextPage:
          page < totalPages,
        hasPreviousPage:
          page > 1,
      },
    })
  } catch (error) {
    console.error(
      "Get invoices error:",
      error
    )

    return NextResponse.json(
      {
        error: "Failed to fetch invoices.",
      },
      {
        status: 500,
      }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    // --------------------------------------------------
    // 1. Authenticate user
    // --------------------------------------------------

    const token = req.cookies.get("token")?.value

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
        { error: "Invalid or expired authentication token" },
        { status: 401 }
      )
    }

    const userId = decoded.userId

    if (!userId) {
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      )
    }

    // --------------------------------------------------
    // 2. Parse request body
    // --------------------------------------------------

    const body = (await req.json()) as CreateInvoiceBody

    const {
      customerId,
      currency,
      issueDate,
      dueDate,
      paymentTerm,
      discount = 0,
      taxRate = 0,
      notes,
      items,
      status = "DRAFT",
      send = false,
    } = body

    // --------------------------------------------------
    // 3. Basic validation
    // --------------------------------------------------

    if (status !== "DRAFT" && status !== "SENT") {
      return NextResponse.json(
        { error: "Invalid invoice status" },
        { status: 400 }
      )
    }

    if (!customerId) {
      return NextResponse.json(
        { error: "Customer is required" },
        { status: 400 }
      )
    }

    if (!currency) {
      return NextResponse.json(
        { error: "Currency is required" },
        { status: 400 }
      )
    }

    if (!issueDate || !dueDate) {
      return NextResponse.json(
        { error: "Issue date and due date are required" },
        { status: 400 }
      )
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "At least one invoice item is required" },
        { status: 400 }
      )
    }

    // --------------------------------------------------
    // 4. Validate dates
    // --------------------------------------------------

    const parsedIssueDate = new Date(issueDate)
    const parsedDueDate = new Date(dueDate)

    if (
      Number.isNaN(parsedIssueDate.getTime()) ||
      Number.isNaN(parsedDueDate.getTime())
    ) {
      return NextResponse.json(
        { error: "Invalid invoice dates" },
        { status: 400 }
      )
    }

    if (parsedDueDate < parsedIssueDate) {
      return NextResponse.json(
        { error: "Due date cannot be before issue date" },
        { status: 400 }
      )
    }

    // --------------------------------------------------
    // 5. Validate numbers
    // --------------------------------------------------

    if (typeof discount !== "number" || discount < 0) {
      return NextResponse.json({ error: "Invalid discount" }, { status: 400 })
    }

    if (typeof taxRate !== "number" || taxRate < 0) {
      return NextResponse.json({ error: "Invalid tax rate" }, { status: 400 })
    }

    for (const item of items) {
      if (!item.description || typeof item.description !== "string") {
        return NextResponse.json(
          { error: "Each item requires a description" },
          { status: 400 }
        )
      }

      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        return NextResponse.json(
          { error: "Item quantity must be a positive integer" },
          { status: 400 }
        )
      }

      if (
        typeof item.rate !== "number" ||
        item.rate < 0 ||
        !Number.isFinite(item.rate)
      ) {
        return NextResponse.json(
          { error: "Item rate must be a valid number" },
          { status: 400 }
        )
      }
    }

    // --------------------------------------------------
    // 6. Verify customer belongs to authenticated user
    // --------------------------------------------------

    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        userId,
      },
    })

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    // --------------------------------------------------
    // 7. Generate invoice number
    // --------------------------------------------------

    const invoiceNumber = await generateInvoiceNumber()

    // --------------------------------------------------
    // 8. Create invoice + items transactionally
    // --------------------------------------------------

    const invoice = await prisma.$transaction(async (tx) => {
      const createdInvoice = await tx.invoice.create({
        data: {
          invoiceNumber,

          userId,

          customerId,

          // IMPORTANT:
          // The client cannot choose the initial status.
          status: "DRAFT",

          currency,

          issueDate: parsedIssueDate,

          dueDate: parsedDueDate,

          paymentTerm: paymentTerm || null,

          discount,

          taxRate,

          notes: notes?.trim() || null,

          sentAt: status === "SENT" ? new Date() : null,

          lineItems: {
            create: items.map((item) => ({
              description: item.description.trim(),

              quantity: item.quantity,

              rate: item.rate,
            })),
          },
        },

        include: {
          customer: true,
          lineItems: true,
        },
      })

      return createdInvoice
    })

    if (send) {
      const sentInvoice = await sendInvoice(invoice.id, userId)

      return NextResponse.json(
        {
          message: "Invoice created and sent successfully",
          invoice: sentInvoice,
        },
        { status: 201 }
      )
    }

    // --------------------------------------------------
    // 9. Return created invoice
    // --------------------------------------------------

    return NextResponse.json(
      {
        message: "Invoice created successfully",
        invoice,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Create Invoice Error:", error)

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create invoice",
      },
      { status: 500 }
    )
  }
}

async function generateInvoiceNumber() {
  const year = new Date().getFullYear()

  const count = await prisma.invoice.count({
    where: {
      createdAt: {
        gte: new Date(`${year}-01-01T00:00:00.000Z`),
        lt: new Date(`${year + 1}-01-01T00:00:00.000Z`),
      },
    },
  })

  return `INV-${year}-${String(count + 1).padStart(4, "0")}`
}
