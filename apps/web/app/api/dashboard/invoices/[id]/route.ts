import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@repo/db"
import { getAuthenticatedSession } from "@/lib/auth/session"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await getAuthenticatedSession(request)
    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { id } = await params

    // Fetch the single invoice directly by its primary key ID
    const invoice = await prisma.invoice.findFirst({
      where: {
        invoiceNumber: id,
        userId: auth.userId, // Ensures users can only access their own invoices
      },
      include: {
        customer: true,
        lineItems: true,
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 })
    }

    // Return the single object directly
    return NextResponse.json(invoice)
  } catch (error) {
    console.error("Get single invoice error:", error)
    return NextResponse.json(
      { error: "Failed to fetch invoice." },
      { status: 500 }
    )
  }
}

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    // ---------------------------------------------
    // 1. Authenticate user
    // ---------------------------------------------

    const auth = await getAuthenticatedSession(request)

    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // ---------------------------------------------
    // 2. Get invoice ID
    // ---------------------------------------------

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: "Invoice ID is required" },
        { status: 400 }
      )
    }

    // ---------------------------------------------
    // 3. Find invoice and verify ownership
    // ---------------------------------------------

    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        userId: auth.userId,
      },
      select: {
        id: true,
        invoiceNumber: true,
        status: true,
        dueDate: true,
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    // ---------------------------------------------
    // 4. Only drafts can be deleted
    // ---------------------------------------------

    const today = new Date()
    const dueDate = new Date(invoice.dueDate)

    today.setHours(0, 0, 0, 0)
    dueDate.setHours(0, 0, 0, 0)

    if (invoice.status !== "DRAFT" || dueDate < today) {
      return NextResponse.json(
        {
          error:
            "Only draft invoices can be deleted. Sent, paid, overdue, and cancelled invoices cannot be deleted.",
        },
        { status: 409 }
      )
    }

    // ---------------------------------------------
    // 5. Delete invoice
    // ---------------------------------------------

    await prisma.invoice.delete({
      where: {
        id: invoice.id,
      },
    })

    // ---------------------------------------------
    // 6. Return success
    // ---------------------------------------------

    return NextResponse.json({
      message: "Invoice deleted successfully",
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
    })
  } catch (error) {
    console.error("Delete Invoice Error:", error)

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete invoice",
      },
      { status: 500 }
    )
  }
}

interface UpdateInvoiceItem {
  name: string
  description: string
  quantity: number
  rate: number
}

interface UpdateInvoiceBody {
  customerId?: string
  customerName?: string
  customerEmail?: string
  currency?: string
  issueDate: string
  dueDate: string
  paymentTerm?: string
  discount?: number
  taxRate?: number
  notes?: string
  items: UpdateInvoiceItem[]
}

interface JwtPayload {
  userId: string
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // --------------------------------------------------
    // 1. Authenticate user
    // --------------------------------------------------

    const auth = await getAuthenticatedSession(request)

    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // --------------------------------------------------
    // 2. Get invoice ID
    // --------------------------------------------------

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: "Invoice ID is required" },
        { status: 400 }
      )
    }

    // --------------------------------------------------
    // 3. Get existing invoice
    // --------------------------------------------------

    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id,
        userId: auth.userId,
      },
      include: {
        lineItems: true,
      },
    })

    if (!existingInvoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    // --------------------------------------------------
    // 4. Protect immutable invoices
    // --------------------------------------------------

    if (existingInvoice.status === "PAID") {
      return NextResponse.json(
        {
          error: "Paid invoices cannot be edited.",
        },
        { status: 409 }
      )
    }

    if (existingInvoice.status === "CANCELLED") {
      return NextResponse.json(
        {
          error: "Cancelled invoices cannot be edited.",
        },
        { status: 409 }
      )
    }

    // --------------------------------------------------
    // 5. Parse request body
    // --------------------------------------------------

    const body = (await request.json()) as UpdateInvoiceBody

    const {
      customerId,
      customerName,
      customerEmail,
      currency,
      issueDate,
      dueDate,
      paymentTerm,
      discount,
      taxRate,
      notes,
      items,
    } = body

    // --------------------------------------------------
    // 6. Validate items
    // --------------------------------------------------

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          error: "At least one invoice item is required.",
        },
        { status: 400 }
      )
    }

    for (const item of items) {
      if (!item.name?.trim() || !item.description?.trim()) {
        return NextResponse.json(
          {
            error: "Each invoice item must have a name and description.",
          },
          { status: 400 }
        )
      }

      if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
        return NextResponse.json(
          {
            error: "Each item quantity must be greater than zero.",
          },
          { status: 400 }
        )
      }

      if (!Number.isFinite(item.rate) || item.rate < 0) {
        return NextResponse.json(
          {
            error: "Each item rate must be zero or greater.",
          },
          { status: 400 }
        )
      }
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
        { error: "Invalid issue or due date." },
        { status: 400 }
      )
    }

    if (parsedDueDate < parsedIssueDate) {
      return NextResponse.json(
        {
          error: "Due date cannot be before the issue date.",
        },
        { status: 400 }
      )
    }

    // --------------------------------------------------
    // 8. Validate discount and tax
    // --------------------------------------------------

    const resolvedDiscount = discount ?? 0
    const resolvedTaxRate = taxRate ?? 0

    if (
      !Number.isFinite(resolvedDiscount) ||
      resolvedDiscount < 0 ||
      resolvedDiscount > 100
    ) {
      return NextResponse.json(
        {
          error: "Discount must be between 0 and 100.",
        },
        { status: 400 }
      )
    }

    if (
      !Number.isFinite(resolvedTaxRate) ||
      resolvedTaxRate < 0 ||
      resolvedTaxRate > 100
    ) {
      return NextResponse.json(
        {
          error: "Tax rate must be between 0 and 100.",
        },
        { status: 400 }
      )
    }

    // --------------------------------------------------
    // 9. Resolve customer
    // --------------------------------------------------

    let resolvedCustomerId = existingInvoice.customerId

    // Scenario A: An explicit customerId is provided (Best Practice)
    if (customerId) {
      const customer = await prisma.customer.findFirst({
        where: {
          id: customerId,
          userId: auth.userId,
        },
      })

      if (!customer) {
        return NextResponse.json(
          { error: "Customer not found." },
          { status: 404 }
        )
      }

      // Update both name and email for the known customer record
      const email = customerEmail?.trim().toLowerCase()
      const name = customerName?.trim()

      const updatedCustomer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          ...(name && { name }),
          ...(email && { email }),
        },
      })

      resolvedCustomerId = updatedCustomer.id

      // Scenario B: No customerId provided, handling fallback input text fields
    } else if (customerEmail || customerName) {
      const email = customerEmail?.trim().toLowerCase()
      const name = customerName?.trim()

      if (!email || !name) {
        return NextResponse.json(
          {
            error:
              "Customer name and email are required to create a new profile.",
          },
          { status: 400 }
        )
      }

      // Check if this fallback email already exists under a different workflow
      const existingCustomer = await prisma.customer.findFirst({
        where: { userId: auth.userId, email },
      })

      if (existingCustomer) {
        resolvedCustomerId = existingCustomer.id

        await prisma.customer.update({
          where: { id: existingCustomer.id },
          data: { name }, // Email is already matching here
        })
      } else {
        const newCustomer = await prisma.customer.create({
          data: { userId: auth.userId, name, email },
        })

        resolvedCustomerId = newCustomer.id
      }
    }

    // --------------------------------------------------
    // 10. Update invoice + replace line items
    // --------------------------------------------------

    const updatedInvoice = await prisma.$transaction(async (tx) => {
      await tx.lineItem.deleteMany({
        where: {
          invoiceId: existingInvoice.id,
        },
      })

      return tx.invoice.update({
        where: {
          id: existingInvoice.id,
        },
        data: {
          customerId: resolvedCustomerId,
          currency: currency?.trim() || existingInvoice.currency,
          issueDate: parsedIssueDate,
          dueDate: parsedDueDate,
          paymentTerm: paymentTerm?.trim() || existingInvoice.paymentTerm,
          discount: resolvedDiscount,
          taxRate: resolvedTaxRate,
          notes: notes?.trim() || null,

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
    })

    // --------------------------------------------------
    // 11. Tell frontend whether explicit resend is needed
    // --------------------------------------------------

    const requiresResend = existingInvoice.status === "SENT"

    return NextResponse.json(
      {
        message: requiresResend
          ? "Invoice updated. The updated invoice has not been sent."
          : "Invoice updated successfully.",

        invoice: updatedInvoice,

        requiresResend,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Update invoice error:", error)

    return NextResponse.json(
      {
        error: "Failed to update invoice.",
      },
      { status: 500 }
    )
  }
}
