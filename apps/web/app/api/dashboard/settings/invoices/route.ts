import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@repo/db"
import { invoiceSettingsSchema } from "@/components/settings/settings-schema"
import { getAuthenticatedSession } from "@/lib/auth/session"

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedSession(request)

    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const invoiceSettings = await prisma.invoiceSettings.findUnique({
      where: {
        userId: auth.userId,
      },
    })

    return NextResponse.json({
      invoiceSettings,
    })
  } catch (error) {
    console.error("Get invoice settings error:", error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch invoice settings",
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await getAuthenticatedSession(request)

    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()

    const parsed = invoiceSettingsSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid invoice settings",
          issues: parsed.error.flatten(),
        },
        { status: 400 }
      )
    }

    const data = parsed.data

    const invoiceSettings = await prisma.invoiceSettings.upsert({
      where: {
        userId: auth.userId,
      },

      create: {
        userId: auth.userId,
        invoiceNumberPrefix: data.invoiceNumberPrefix,
        nextInvoiceNumber: data.nextInvoiceNumber,
        defaultCurrency: data.defaultCurrency,
        defaultPaymentTerm: data.defaultPaymentTerm,
        defaultTaxRate: data.defaultTaxRate,
        defaultDiscount: data.defaultDiscount,
        defaultNotes: data.defaultNotes || null,
      },

      update: {
        invoiceNumberPrefix: data.invoiceNumberPrefix,
        nextInvoiceNumber: data.nextInvoiceNumber,
        defaultCurrency: data.defaultCurrency,
        defaultPaymentTerm: data.defaultPaymentTerm,
        defaultTaxRate: data.defaultTaxRate,
        defaultDiscount: data.defaultDiscount,
        defaultNotes: data.defaultNotes || null,
      },

      select: {
        id: true,
        userId: true,
        invoiceNumberPrefix: true,
        nextInvoiceNumber: true,
        defaultCurrency: true,
        defaultPaymentTerm: true,
        defaultTaxRate: true,
        defaultDiscount: true,
        defaultNotes: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      message: "Invoice settings updated successfully",
      invoiceSettings,
    })
  } catch (error) {
    console.error("Update invoice settings error:", error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update invoice settings",
      },
      { status: 500 }
    )
  }
}
