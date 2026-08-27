import { NextRequest, NextResponse } from "next/server"
import { createCheckout } from "@/lib/payments/payment"

interface RouteContext {
  params: Promise<{
    invoiceId: string
  }>
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    // 🚀 1. EXTRACT PARAMS (Mirrors your elegant Send Endpoint pattern)
    const { invoiceId } = await params

    if (!invoiceId) {
      return NextResponse.json(
        { error: "Invoice ID parameter is required" },
        { status: 400 }
      )
    }

    // 🚀 2. DEFENSIVE BODY EXTRACTION (Prevents HTML format syntax errors)
    const rawText = await req.text()

    if (!rawText.trim() || rawText.trim().startsWith("<!DOCTYPE")) {
      console.error(
        "🚨 CRITICAL: Inbound payload data is empty or intercepted as HTML!"
      )
      return NextResponse.json(
        {
          error:
            "Invalid payload formatting. Expected clean JSON application metadata.",
        },
        { status: 400 }
      )
    }

    const body = JSON.parse(rawText)

    // 🚀 3. DELEGATE EXECUTION (Keeps the controller ultra-lightweight)
    const checkout = await createCheckout(
      invoiceId,
      body.businessCountry,
      body.customerCountry
    )

    return NextResponse.json(checkout, { status: 200 })
  } catch (error) {
    console.error("❌ Checkout Endpoint Execution Failure:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to initiate payment session link",
      },
      { status: 400 }
    )
  }
}
