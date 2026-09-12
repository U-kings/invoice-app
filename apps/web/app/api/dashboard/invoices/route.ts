import { NextRequest, NextResponse } from "next/server"
import { Prisma, prisma } from "@repo/db"
import { sendInvoice } from "@/lib/invoices/send-invoice"
import { getInvoiceReminderSettings } from "@/lib/invoice-reminders/get-reminder-settings"
import { scheduleInvoiceReminders } from "@/lib/invoice-reminders/schedule-invoice-reminders"
import { checkInvoiceCreationLimit } from "@/lib/billing/check-invoice-creation-limit"

interface CreateInvoiceItem {
  name: string
  description: string
  quantity: number
  rate: number
}

interface CreateInvoiceBody {
  customerId: string
  customerEmail: string
  customerName: string
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
import { getAuthenticatedSession } from "@/lib/auth/session"

const statusMap: Record<string, PrismaInvoiceStatus> = {
  Sent: "SENT",
  Paid: "PAID",
  Overdue: "OVERDUE",
  Draft: "DRAFT",
  Cancelled: "CANCELLED",
}

export async function GET(request: NextRequest) {
  try {
    // ---------------------------------------------------------
    // 1. Get authentication token
    // ---------------------------------------------------------

    const auth = await getAuthenticatedSession(request)

    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // ---------------------------------------------------------
    // 3. Query parameters
    // ---------------------------------------------------------

    const { searchParams } = new URL(request.url)

    const search = searchParams.get("search")?.trim() || ""

    const status = searchParams.get("status")?.trim() || ""

    const page = Math.max(Number(searchParams.get("page")) || 1, 1)

    const pageSize = Math.min(
      Math.max(Number(searchParams.get("pageSize")) || 10, 1),
      100
    )

    const skip = (page - 1) * pageSize

    // ---------------------------------------------------------
    // 4. Validate status
    // ---------------------------------------------------------

    let statusFilter: PrismaInvoiceStatus | undefined

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
      userId: auth.userId,

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

    const [invoices, total] = await prisma.$transaction([
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

    const totalPages = Math.ceil(total / pageSize)

    return NextResponse.json({
      data: invoices,

      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    })
  } catch (error) {
    console.error("Get invoices error:", error)

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

export async function POST(request: NextRequest) {
  try {
    // --------------------------------------------------
    // 1. Authenticate user
    // --------------------------------------------------
    const auth = await getAuthenticatedSession(request)

    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // --------------------------------------------------
    // 2. Parse request body
    // --------------------------------------------------

    const body = (await request.json()) as CreateInvoiceBody

    const {
      customerId,
      customerEmail,
      customerName,
      currency,
      issueDate,
      dueDate,
      paymentTerm,
      discount,
      taxRate,
      notes,
      items,
      send = false,
    } = body

    // --------------------------------------------------
    // 3. Basic validation
    // --------------------------------------------------

    // Dynamic Customer Check: Must provide an existing ID OR complete info for a new customer
    if (!customerId && (!customerEmail || !customerName)) {
      return NextResponse.json(
        {
          error:
            "Customer is required, complete details (name and email) to create a new customer.",
          // "Provide either a customerId or complete details (name and email) to create a new customer.",
        },
        { status: 400 }
      )
    }

    // if (!customerId) {
    //   return NextResponse.json(
    //     { error: "Customer is required" },
    //     { status: 400 }
    //   )
    // }

    if (!issueDate || !dueDate) {
      return NextResponse.json(
        {
          error: "Issue date and due date are required",
        },
        { status: 400 }
      )
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          error: "At least one invoice item is required",
        },
        { status: 400 }
      )
    }

    // --------------------------------------------------
    // 4. Load invoice settings
    // --------------------------------------------------

    const invoiceSettings = await prisma.invoiceSettings.findUnique({
      where: {
        userId: auth.userId,
      },
    })

    // --------------------------------------------------
    // 5. Resolve defaults
    // --------------------------------------------------

    const finalCurrency = currency || invoiceSettings?.defaultCurrency || "NGN"

    const finalPaymentTerm =
      paymentTerm || invoiceSettings?.defaultPaymentTerm || "Due-on-receipt"

    const finalTaxRate =
      typeof taxRate === "number"
        ? taxRate
        : Number(invoiceSettings?.defaultTaxRate ?? 0)

    const finalDiscount =
      typeof discount === "number"
        ? discount
        : Number(invoiceSettings?.defaultDiscount ?? 0)

    const finalNotes = notes?.trim() || invoiceSettings?.defaultNotes || null

    // --------------------------------------------------
    // 6. Validate resolved values
    // --------------------------------------------------

    if (!finalCurrency.trim()) {
      return NextResponse.json(
        { error: "Currency is required" },
        { status: 400 }
      )
    }

    if (
      typeof finalDiscount !== "number" ||
      !Number.isFinite(finalDiscount) ||
      finalDiscount < 0 ||
      finalDiscount > 100
    ) {
      return NextResponse.json({ error: "Invalid discount" }, { status: 400 })
    }

    if (
      typeof finalTaxRate !== "number" ||
      !Number.isFinite(finalTaxRate) ||
      finalTaxRate < 0 ||
      finalTaxRate > 100
    ) {
      return NextResponse.json({ error: "Invalid tax rate" }, { status: 400 })
    }

    // --------------------------------------------------
    // 7. Validate dates
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
        {
          error: "Due date cannot be before issue date",
        },
        { status: 400 }
      )
    }

    // --------------------------------------------------
    // 8. Validate line items
    // --------------------------------------------------

    for (const item of items) {
      if (!item.description || typeof item.description !== "string") {
        return NextResponse.json(
          {
            error: "Each item requires a description",
          },
          { status: 400 }
        )
      }

      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        return NextResponse.json(
          {
            error: "Item quantity must be a positive integer",
          },
          { status: 400 }
        )
      }

      if (
        typeof item.rate !== "number" ||
        item.rate < 0 ||
        !Number.isFinite(item.rate)
      ) {
        return NextResponse.json(
          {
            error: "Item rate must be a valid number",
          },
          { status: 400 }
        )
      }

      if (!item.name || typeof item.name !== "string") {
        return NextResponse.json(
          {
            error: "Each item requires a name",
          },
          { status: 400 }
        )
      }
    }

    // --------------------------------------------------
    // 9. Resolve or Upsert Customer safely
    // --------------------------------------------------

    let resolvedCustomerId: string

    if (customerId) {
      // Scenario A: Customer ID was provided. Verify it exists and belongs to this user.
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          id: customerId,
          userId: auth.userId,
        },
      })

      if (!existingCustomer) {
        return NextResponse.json(
          {
            error:
              "The provided customer does not exist or does not belong to your account.",
          },
          { status: 404 }
        )
      }

      resolvedCustomerId = existingCustomer.id
    } else {
      // Scenario B: No customerId provided. Handle dynamic on-the-fly customer creation.
      const cleanEmail = customerEmail!.toLowerCase().trim()

      // Enforce isolation: Ensure this user hasn't already registered this email in their customer table
      const duplicateCustomer = await prisma.customer.findFirst({
        where: {
          userId: auth.userId,
          email: cleanEmail,
        },
      })

      if (duplicateCustomer) {
        return NextResponse.json(
          {
            error:
              "A customer with this email address already exists in your account. Please use their customer identifier.",
          },
          { status: 400 }
        )
      }

      // Create the new customer record since it passed the validation check
      const newCustomer = await prisma.customer.create({
        data: {
          userId: auth.userId,
          name: customerName!.trim(),
          email: cleanEmail,
        },
      })

      resolvedCustomerId = newCustomer.id
    }

    // --------------------------------------------------
    // 10. Create invoice transactionally
    // --------------------------------------------------

    const reminderSettings = await getInvoiceReminderSettings(auth.userId)

    const invoice = await prisma.$transaction(
      async (tx) => {
        // ----------------------------------------------
        // Check invoice creation limit
        // ----------------------------------------------

        const invoiceLimit = await checkInvoiceCreationLimit(tx, auth.userId)

        if (!invoiceLimit.allowed) {
          throw new Error(
            `FREE_INVOICE_LIMIT_REACHED:${invoiceLimit.count}:${invoiceLimit.limit}`
          )
        }

        // ----------------------------------------------
        // Get or create invoice settings
        // ----------------------------------------------

        const settings = await tx.invoiceSettings.upsert({
          where: {
            userId: auth.userId,
          },

          create: {
            userId: auth.userId,
            invoiceNumberPrefix: "INV-",
            nextInvoiceNumber: 1,
            defaultCurrency: "NGN",
            defaultPaymentTerm: "Due-on-receipt",
            defaultTaxRate: 0,
            defaultDiscount: 0,
            defaultNotes: null,
          },

          update: {},
        })

        // ----------------------------------------------
        // Reserve invoice number
        // ----------------------------------------------

        const invoiceNumber = `${settings.invoiceNumberPrefix}${settings.nextInvoiceNumber}`

        // ----------------------------------------------
        // Increment counter
        // ----------------------------------------------

        await tx.invoiceSettings.update({
          where: {
            userId: auth.userId,
          },

          data: {
            nextInvoiceNumber: {
              increment: 1,
            },
          },
        })

        // ----------------------------------------------
        // Create invoice
        // ----------------------------------------------

        const createdInvoice = await tx.invoice.create({
          data: {
            invoiceNumber,

            userId: auth.userId,

            customerId: resolvedCustomerId,

            status: "DRAFT",

            currency: finalCurrency,

            issueDate: parsedIssueDate,

            dueDate: parsedDueDate,

            paymentTerm: finalPaymentTerm || null,

            discount: finalDiscount,

            taxRate: finalTaxRate,

            notes: finalNotes,

            sentAt: null,

            lineItems: {
              create: items.map((item) => ({
                name: item.name.trim(),
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

        // ----------------------------------------------
        // Schedule reminders
        // ----------------------------------------------

        if (send) {
          await scheduleInvoiceReminders({
            tx,
            invoiceId: createdInvoice.id,
            userId: auth.userId,
            issueDate: parsedIssueDate,
            dueDate: parsedDueDate,
            settings: reminderSettings,
          })
        }

        return createdInvoice
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    )
    // --------------------------------------------------
    // Send invoice if requested
    // --------------------------------------------------

    if (send) {
      // ----------------------------------------------
      // 1. Send invoice
      // ----------------------------------------------

      const sentInvoice = await sendInvoice(invoice.id, auth.userId)

      return NextResponse.json(
        {
          message: "Invoice created and sent successfully",
          invoice: sentInvoice,
        },
        { status: 201 }
      )
    }

    // --------------------------------------------------
    // 12. Return created invoice
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

    if (
      error instanceof Error &&
      error.message.startsWith("FREE_INVOICE_LIMIT_REACHED:")
    ) {
      const [, count, limit] = error.message.split(":")

      return NextResponse.json(
        {
          error:
            "You have reached your free plan invoice limit for this month.",
          code: "FREE_INVOICE_LIMIT_REACHED",
          usage: {
            count: Number(count),
            limit: Number(limit),
          },
        },
        { status: 403 }
      )
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create invoice",
      },
      { status: 500 }
    )
  }
}
