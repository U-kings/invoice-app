import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@repo/db"

export async function GET(req: NextRequest) {
  try {
    // 1. Extract the transaction reference from the query parameters
    const { searchParams } = new URL(req.url)
    const reference = searchParams.get("reference")

    if (!reference) {
      return NextResponse.json(
        { error: "Transaction reference query parameter is required" },
        { status: 400 }
      )
    }

    // 2. Query Paystack's server directly to verify the transaction
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY
    if (!paystackSecret) {
      throw new Error("Missing system environment configurations: PAYSTACK_SECRET_KEY")
    }

    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (!paystackResponse.ok) {
      return NextResponse.json(
        { error: "Failed to communicate with payment gateway verification engine" },
        { status: 502 }
      )
    }

    const resData = await paystackResponse.json()

    // 3. Ensure the gateway explicitly confirms a successful transaction
    if (!resData.status || resData.data?.status !== "success") {
      return NextResponse.json(
        { error: "Transaction verification failed or remains uncompleted", details: resData.message },
        { status: 400 }
      )
    }

    // 4. ATOMIC DATABASE TRANSACTION (Idempotence & Sync Isolation)
    const dbResult = await prisma.$transaction(async (tx) => {
      // Find the corresponding payment record matching this unique reference
      const payment = await tx.payment.findFirst({
        where: { providerReference: reference },
      })

      if (!payment) {
        throw new Error(`Transaction footprint [${reference}] not registered in local system database.`)
      }

      // Idempotency: If the webhook already processed this, immediately step down without an error
      if (payment.status === "SUCCESS") {
        return {
          status: "ALREADY_SETTLED",
          message: "Transaction previously processed and closed.",
        }
      }

      // Update the payment log tracking entry to SUCCESS
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: { status: "SUCCESS" as any },
      })

      // Update the associated invoice workflow lifecycle to PAID
      const updatedInvoice = await tx.invoice.update({
        where: { id: payment.invoiceId },
        data: { status: "PAID" as any },
      })

      return {
        status: "NEWLY_SETTLED",
        payment: updatedPayment,
        invoice: updatedInvoice,
      }
    })

    return NextResponse.json(
      { success: true, message: "Payment validated and captured securely", data: dbResult },
      { status: 200 }
    )

  } catch (error: any) {
    console.error("💥 PAYMENT VERIFICATION EXCEPTION CAUGHT:", error)

    if (error.message?.includes("not registered in local system")) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json(
      { error: "Internal processing error during transaction validation cycle" },
      { status: 500 }
    )
  }
}
