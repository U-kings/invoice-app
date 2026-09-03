import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@repo/db"

import { decryptSecret } from "@/lib/security/encryption"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const reference = searchParams.get("reference")

    if (!reference) {
      return NextResponse.json(
        {
          error: "Transaction reference query parameter is required",
        },
        { status: 400 }
      )
    }

    /*
     * Find the local payment using the Paystack reference.
     *
     * We do NOT require a JWT here because this endpoint is part
     * of the public invoice payment flow.
     *
     * The payment itself tells us which invoice/business owns it.
     */
    const payment = await prisma.payment.findFirst({
      where: {
        providerReference: reference,
        provider: "PAYSTACK",
      },
      select: {
        id: true,
        invoiceId: true,
        status: true,
        provider: true,
        providerReference: true,
        amount: true,
        currency: true,

        invoice: {
          select: {
            id: true,
            userId: true,
            status: true,
          },
        },
      },
    })

    if (!payment) {
      return NextResponse.json(
        {
          error: "Payment transaction was not found.",
        },
        { status: 404 }
      )
    }

    /*
     * Idempotency:
     *
     * If this payment has already been successfully processed,
     * don't call Paystack again or update the invoice again.
     */
    if (payment.status === "SUCCESS") {
      return NextResponse.json({
        success: true,
        message: "Transaction previously processed and closed.",
        data: {
          status: "ALREADY_SETTLED",
          paymentId: payment.id,
          invoiceId: payment.invoiceId,
        },
      })
    }

    /*
     * Get the Paystack connection belonging to the BUSINESS
     * that owns this invoice.
     */
    const connection = await prisma.paymentProviderConnection.findUnique({
      where: {
        userId_provider: {
          userId: payment.invoice.userId,
          provider: "PAYSTACK",
        },
      },
      select: {
        status: true,
        encryptedSecretKey: true,
      },
    })

    if (
      !connection ||
      connection.status !== "CONNECTED" ||
      !connection.encryptedSecretKey
    ) {
      return NextResponse.json(
        {
          error: "Paystack is not connected for this account.",
        },
        { status: 400 }
      )
    }

    /*
     * Decrypt the business owner's Paystack secret.
     *
     * This happens only on the server.
     * The secret is NEVER returned to the customer.
     */
    const paystackSecret = decryptSecret(connection.encryptedSecretKey)

    /*
     * Verify the transaction directly with Paystack.
     */
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(
        reference
      )}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    )

    if (!paystackResponse.ok) {
      console.error(
        "Paystack verification request failed:",
        paystackResponse.status
      )

      return NextResponse.json(
        {
          error: "Failed to communicate with Paystack verification service.",
        },
        { status: 502 }
      )
    }

    const resData = await paystackResponse.json()

    /*
     * Paystack must report a successful transaction.
     */
    if (!resData.status || resData.data?.status !== "success") {
      return NextResponse.json(
        {
          error: "Transaction verification failed or remains uncompleted.",
          details: resData.message,
        },
        { status: 400 }
      )
    }

    /*
     * IMPORTANT:
     *
     * Verify the Paystack transaction matches our local payment.
     *
     * Never mark an invoice as paid simply because Paystack returned
     * a successful transaction for the supplied reference.
     */
    const paystackAmount = Number(resData.data?.amount)
    const localAmountInKobo = Math.round(Number(payment.amount) * 100)

    const paystackCurrency = resData.data?.currency
    const paystackReference = resData.data?.reference

    if (
      paystackReference !== payment.providerReference ||
      paystackAmount !== localAmountInKobo ||
      paystackCurrency !== payment.currency
    ) {
      console.error("Paystack transaction mismatch:", {
        expected: {
          reference: payment.providerReference,
          amount: localAmountInKobo,
          currency: payment.currency,
        },
        received: {
          reference: paystackReference,
          amount: paystackAmount,
          currency: paystackCurrency,
        },
      })

      return NextResponse.json(
        {
          error: "Verified transaction does not match the expected payment.",
        },
        { status: 400 }
      )
    }

    /*
     * Atomic local settlement.
     *
     * This protects against two verification requests attempting
     * to settle the same payment simultaneously.
     */
    const dbResult = await prisma.$transaction(async (tx) => {
      const currentPayment = await tx.payment.findUnique({
        where: {
          id: payment.id,
        },
      })

      if (!currentPayment) {
        throw new Error("Payment record no longer exists.")
      }

      /*
       * Another request may have settled it while we were
       * communicating with Paystack.
       */
      if (currentPayment.status === "SUCCESS") {
        return {
          status: "ALREADY_SETTLED" as const,
          message: "Transaction previously processed and closed.",
          paymentId: currentPayment.id,
          invoiceId: currentPayment.invoiceId,
        }
      }

      const updatedPayment = await tx.payment.update({
        where: {
          id: currentPayment.id,
        },
        data: {
          status: "SUCCESS",
        },
      })

      const updatedInvoice = await tx.invoice.update({
        where: {
          id: currentPayment.invoiceId,
        },
        data: {
          status: "PAID",
        },
      })

      return {
        status: "NEWLY_SETTLED" as const,
        payment: updatedPayment,
        invoice: updatedInvoice,
      }
    })

    return NextResponse.json(
      {
        success: true,
        message: "Payment validated and captured securely.",
        data: dbResult,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("💥 PAYMENT VERIFICATION EXCEPTION CAUGHT:", error)

    return NextResponse.json(
      {
        error: "Internal processing error during transaction validation cycle.",
      },
      { status: 500 }
    )
  }
}
