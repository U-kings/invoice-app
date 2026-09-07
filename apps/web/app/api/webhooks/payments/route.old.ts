import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@repo/db"
import * as crypto from "crypto"

function safeTimingCheck(computedHash: string, inboundSignature: string): boolean {
  const a = Buffer.from(computedHash, "utf8")
  const b = Buffer.from(inboundSignature, "utf8")

  if (a.length !== b.length) return false 
  return crypto.timingSafeEqual(a, b)
}

async function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
  secret: string | undefined,
  algorithm: "sha512" | "sha256" = "sha512"
): Promise<boolean> {
  if (!signature || !secret) return false
  const hash = crypto.createHmac(algorithm, secret).update(rawBody).digest("hex")
  return safeTimingCheck(hash, signature)
}

function verifyStripeSignature(
  rawBody: string,
  signature: string | null,
  secret: string | undefined
): boolean {
  if (!signature || !secret) return false

  const parts = signature.split(",")
  const timestamp = parts.find((p) => p.startsWith("t="))?.split("=")[1]
  const v1Signatures = parts
    .filter((p) => p.startsWith("v1="))
    .map((p) => p.split("=")[1])
    .filter((sig): sig is string => typeof sig === "string")

  if (!timestamp || v1Signatures.length === 0) return false

  const signedPayload = `${timestamp}.${rawBody}`
  const computedHash = crypto.createHmac("sha256", secret).update(signedPayload).digest("hex")

  return v1Signatures.some((v1Sig) => safeTimingCheck(computedHash, v1Sig))
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()

    let isVerified = false
    let providerReference = ""
    let shouldProcessTransaction = false

    const paystackSignature = req.headers.get("x-paystack-signature")
    const flutterwaveSignature = req.headers.get("verif-hash")
    const stripeSignature = req.headers.get("stripe-signature")

    // ---------------------------------------------------------
    // 1. GATEWAY HANDSHAKE EVALUATION
    // ---------------------------------------------------------
    if (paystackSignature) {
      isVerified = await verifyWebhookSignature(
        rawBody,
        paystackSignature,
        process.env.PAYSTACK_SECRET_KEY,
        "sha512"
      )

      if (isVerified) {
        const payload = JSON.parse(rawBody)
        // Guard checking structure
        if (payload.event === "charge.success" && payload.data?.status === "success") {
          providerReference = payload.data.reference
          shouldProcessTransaction = true
        }
      }
    } else if (flutterwaveSignature) {
      isVerified = safeTimingCheck(
        process.env.FLUTTERWAVE_SECRET_HASH || "",
        flutterwaveSignature
      )

      if (isVerified) {
        const payload = JSON.parse(rawBody)
        if (
          payload.status === "successful" ||
          payload.event === "charge.completed"
        ) {
          // Fallback sequence targeting native references
          providerReference = payload.data?.tx_ref || payload.data?.reference
          shouldProcessTransaction = true
        }
      }
    } else if (stripeSignature) {
      isVerified = verifyStripeSignature(
        rawBody,
        stripeSignature,
        process.env.STRIPE_WEBHOOK_SECRET
      )

      if (isVerified) {
        const payload = JSON.parse(rawBody)
        if (payload.type === "checkout.session.completed") {
          providerReference = payload.data.object.id
          shouldProcessTransaction = true
        }
      }
    }

    // 2. Clear security wall block early
    if (!isVerified) {
      return NextResponse.json(
        { error: "Cryptographic signature validation failure" },
        { status: 401 }
      )
    }

    // 3. Early exit for unhandled webhook events
    if (!shouldProcessTransaction || !providerReference) {
      return NextResponse.json(
        { message: "Webhook signature verified, but event type skipped" },
        { status: 200 }
      )
    }

    // ---------------------------------------------------------
    // 2. ATOMIC TRANSACTIONS PROCESSING
    // ---------------------------------------------------------
    const result = await prisma.$transaction(async (tx) => {
      // 🚀 FIXED: Search purely by the unique reference identifier, NOT status
      const payment = await tx.payment.findFirst({
        where: { providerReference: providerReference },
      })

      if (!payment) {
        throw new Error(`Payment entry matching reference [${providerReference}] not found in database.`)
      }

      // 🚀 FIXED: If it's already marked as SUCCESS, exit gracefully with a clear message 
      if (payment.status === "SUCCESS") {
        return {
          message: "Idempotent block: Transaction was already processed and finalized.",
          updatedPayment: payment,
          status: "ALREADY_PROCESSED"
        }
      }

      // Update the Payment log state cleanly
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: { status: "SUCCESS" as any },
      })

      // Cascade update your parent Invoice state workflow cleanly
      const updatedInvoice = await tx.invoice.update({
        where: { id: payment.invoiceId },
        data: { status: "PAID" as any },
      })

      return { updatedPayment, updatedInvoice, status: "NEWLY_PROCESSED" }
    })

    return NextResponse.json({ received: true, result }, { status: 200 })
  } catch (error: any) {
    console.error("💥 SYSTEM CRITICAL: Webhook Route Fault:", error)
    
    // Return a 200 even if the payment record wasn't found in your system 
    // to prevent payment providers from continuously hammering your server.
    if (error.message?.includes("not found in database")) {
      return NextResponse.json({ error: error.message }, { status: 200 })
    }

    return NextResponse.json(
      { error: "Webhook Processing Failed" },
      { status: 500 }
    )
  }
}
