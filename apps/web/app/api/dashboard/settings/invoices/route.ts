import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { prisma } from "@repo/db"
import { invoiceSettingsSchema } from "@/components/settings/settings-schema"

interface AuthPayload {
  userId: string
}

async function getAuthenticatedUserId(req: NextRequest) {
  const token = req.cookies.get("token")?.value

  if (!token) {
    return null
  }

  const jwtSecret = process.env.JWT_SECRET

  if (!jwtSecret) {
    throw new Error("JWT_SECRET environment variable is missing")
  }

  try {
    const decoded = jwt.verify(
      token,
      jwtSecret
    ) as AuthPayload

    return decoded.userId || null
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req)

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const invoiceSettings =
      await prisma.invoiceSettings.findUnique({
        where: {
          userId,
        },
      })

    return NextResponse.json({
      invoiceSettings,
    })
  } catch (error) {
    console.error(
      "Get invoice settings error:",
      error
    )

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

export async function PATCH(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req)

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()

    const parsed =
      invoiceSettingsSchema.safeParse(body)

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

    const invoiceSettings =
      await prisma.invoiceSettings.upsert({
        where: {
          userId,
        },

        create: {
          userId,
          invoiceNumberPrefix:
            data.invoiceNumberPrefix,
          nextInvoiceNumber:
            data.nextInvoiceNumber,
          defaultCurrency:
            data.defaultCurrency,
          defaultPaymentTerm:
            data.defaultPaymentTerm,
          defaultTaxRate:
            data.defaultTaxRate,
          defaultDiscount:
            data.defaultDiscount,
          defaultNotes:
            data.defaultNotes || null,
        },

        update: {
          invoiceNumberPrefix:
            data.invoiceNumberPrefix,
          nextInvoiceNumber:
            data.nextInvoiceNumber,
          defaultCurrency:
            data.defaultCurrency,
          defaultPaymentTerm:
            data.defaultPaymentTerm,
          defaultTaxRate:
            data.defaultTaxRate,
          defaultDiscount:
            data.defaultDiscount,
          defaultNotes:
            data.defaultNotes || null,
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
    console.error(
      "Update invoice settings error:",
      error
    )

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