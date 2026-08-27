import { NextResponse } from "next/server"
import { prisma } from "@repo/db"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    if (!token) {
      return NextResponse.json(
        { error: "Payment link is invalid" },
        { status: 400 }
      )
    }

    const invoice = await prisma.invoice.findUnique({
      where: {
        publicToken: token,
      },
      include: {
        lineItems: true,
        customer: true,
        user: {
        include: {
          businessProfile: true, // Access user.businessProfile.countryCode
        },
      },
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    if (invoice.status === "CANCELLED") {
      return NextResponse.json(
        {
          error: "This invoice has been cancelled.",
        },
        { status: 410 }
      )
    }

    const subtotal = invoice.lineItems.reduce(
      (sum, item) => sum + Number(item.rate) * item.quantity,
      0
    )

    const discountRate = Number(invoice.discount)

    const discountAmount = subtotal * (discountRate / 100)

    const taxableAmount = Math.max(subtotal - discountAmount, 0)

    const taxRate = Number(invoice.taxRate)

    const tax = taxableAmount * (taxRate / 100)

    const total = taxableAmount + tax

    return NextResponse.json({
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        status: invoice.status,
        currency: invoice.currency,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        paymentTerm: invoice.paymentTerm,
        notes: invoice.notes,

        customer: {
          name: invoice.customer.name,
          email: invoice.customer.email,
        },

        items: invoice.lineItems.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          price: Number(item.rate),
          amount: Number(item.rate) * item.quantity,
        })),

        subtotal,
        discountRate,
        discountAmount,
        taxRate,
        tax,
        total,
      },
    })
  } catch (error) {
    console.error("Public Invoice Error:", error)

    return NextResponse.json(
      {
        error: "Failed to load invoice",
      },
      { status: 500 }
    )
  }
}
