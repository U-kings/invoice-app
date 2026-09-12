import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@repo/db"
import { getAuthenticatedSession } from "@/lib/auth/session"

const paymentSettingsSelect = {
  id: true,
  userId: true,

  paystackEnabled: true,
  stripeEnabled: true,
  paypalEnabled: true,

  cardPayments: true,
  bankTransfer: true,
  cashPayments: true,

  onlinePayments: true,
  paymentLinks: true,
  partialPayments: true,
  automaticPaymentConfirmation: true,

  bankName: true,
  accountName: true,
  accountNumber: true,
  additionalInformation: true,

  createdAt: true,
  updatedAt: true,
} as const

export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedSession(request)

  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const paymentSettings = await prisma.paymentSettings.upsert({
      where: {
        userId: auth.userId,
      },
      create: {
        userId: auth.userId,
      },
      update: {},
      select: paymentSettingsSelect,
    })

    return NextResponse.json(paymentSettings)
  } catch (error) {
    console.error("Failed to fetch payment settings:", error)

    return NextResponse.json(
      { error: "Failed to fetch payment settings" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await getAuthenticatedSession(request)

  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }
  try {
    const body = await request.json()

    const {
      paystackEnabled,
      stripeEnabled,
      paypalEnabled,

      cardPayments,
      bankTransfer,
      cashPayments,

      onlinePayments,
      paymentLinks,
      partialPayments,
      automaticPaymentConfirmation,

      bankName,
      accountName,
      accountNumber,
      additionalInformation,
    } = body

    const data: Record<string, unknown> = {}

    if (typeof paystackEnabled === "boolean") {
      data.paystackEnabled = paystackEnabled
    }

    if (typeof stripeEnabled === "boolean") {
      data.stripeEnabled = stripeEnabled
    }

    if (typeof paypalEnabled === "boolean") {
      data.paypalEnabled = paypalEnabled
    }

    if (typeof cardPayments === "boolean") {
      data.cardPayments = cardPayments
    }

    if (typeof bankTransfer === "boolean") {
      data.bankTransfer = bankTransfer
    }

    if (typeof cashPayments === "boolean") {
      data.cashPayments = cashPayments
    }

    if (typeof onlinePayments === "boolean") {
      data.onlinePayments = onlinePayments
    }

    if (typeof paymentLinks === "boolean") {
      data.paymentLinks = paymentLinks
    }

    if (typeof partialPayments === "boolean") {
      data.partialPayments = partialPayments
    }

    if (typeof automaticPaymentConfirmation === "boolean") {
      data.automaticPaymentConfirmation = automaticPaymentConfirmation
    }

    if (typeof bankName === "string" || bankName === null) {
      data.bankName =
        typeof bankName === "string" ? bankName.trim() || null : null
    }

    if (typeof accountName === "string" || accountName === null) {
      data.accountName =
        typeof accountName === "string" ? accountName.trim() || null : null
    }

    if (typeof accountNumber === "string" || accountNumber === null) {
      data.accountNumber =
        typeof accountNumber === "string" ? accountNumber.trim() || null : null
    }

    if (
      typeof additionalInformation === "string" ||
      additionalInformation === null
    ) {
      data.additionalInformation =
        typeof additionalInformation === "string"
          ? additionalInformation.trim() || null
          : null
    }

    const paymentSettings = await prisma.paymentSettings.upsert({
      where: {
        userId: auth.userId,
      },
      create: {
        userId: auth.userId,
        ...data,
      },
      update: data,
      select: paymentSettingsSelect,
    })

    return NextResponse.json(paymentSettings)
  } catch (error) {
    console.error("Failed to update payment settings:", error)

    return NextResponse.json(
      { error: "Failed to update payment settings" },
      { status: 500 }
    )
  }
}
