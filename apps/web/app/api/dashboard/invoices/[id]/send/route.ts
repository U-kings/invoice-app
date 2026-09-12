import { NextRequest, NextResponse } from "next/server"
import { sendInvoice } from "@/lib/invoices/send-invoice"
import { getAuthenticatedSession } from "@/lib/auth/session"

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    // ---------------------------------------------
    // 1. Authenticate
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
    // 3. Send invoice
    // ---------------------------------------------

    const invoice = await sendInvoice(id, auth.userId)

    // ---------------------------------------------
    // 4. Return updated invoice
    // ---------------------------------------------

    return NextResponse.json(
      {
        message: "Invoice sent successfully",
        invoice,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Send Invoice Error:", error)

    const message =
      error instanceof Error ? error.message : "Failed to send invoice"

    return NextResponse.json({ error: message }, { status: 400 })
  }
}
