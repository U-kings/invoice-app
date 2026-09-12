import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@repo/db"
import { getAuthenticatedSession } from "@/lib/auth/session"

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
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
    // 3. Find invoice belonging to user
    // ---------------------------------------------

    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        userId: auth.userId,
      },
    })

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      )
    }

    // ---------------------------------------------
    // 4. Validate current status
    // ---------------------------------------------

    if (invoice.status === "PAID") {
      return NextResponse.json(
        { error: "Invoice is already marked as paid" },
        { status: 409 }
      )
    }

    if (invoice.status === "DRAFT") {
      return NextResponse.json(
        {
          error:
            "A draft invoice cannot be marked as paid",
        },
        { status: 400 }
      )
    }

    if (invoice.status === "CANCELLED") {
      return NextResponse.json(
        {
          error:
            "A cancelled invoice cannot be marked as paid",
        },
        { status: 400 }
      )
    }

    // ---------------------------------------------
    // 5. Mark invoice as paid
    // ---------------------------------------------

    const updatedInvoice =
      await prisma.invoice.update({
        where: {
          id: invoice.id,
        },
        data: {
          status: "PAID",
          paidAt: new Date(),
        },
        include: {
          customer: true,
          lineItems: true,
        },
      })

    // ---------------------------------------------
    // 6. Return updated invoice
    // ---------------------------------------------

    return NextResponse.json({
      message: "Invoice marked as paid",
      invoice: updatedInvoice,
    })
  } catch (error) {
    console.error(
      "Mark Invoice Paid Error:",
      error
    )

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to mark invoice as paid",
      },
      { status: 500 }
    )
  }
}