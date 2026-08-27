import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@repo/db"
import * as crypto from "crypto"

// 🚀 FIXED: Safe timing check wrapper that prevents buffer size inequality crashes
function safeTimingCheck(
  computedHash: string,
  inboundSignature: string
): boolean {
  const a = Buffer.from(computedHash, "utf8")
  const b = Buffer.from(inboundSignature, "utf8")

  if (a.length !== b.length) {
    return false // Abort gracefully without throwing runtime buffer allocation exceptions
  }

  return crypto.timingSafeEqual(a, b)
}

async function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
  secret: string | undefined,
  algorithm: "sha512" | "sha256" = "sha512"
): Promise<boolean> {
  if (!signature || !secret) return false

  const hash = crypto
    .createHmac(algorithm, secret)
    .update(rawBody)
    .digest("hex")

  return safeTimingCheck(hash, signature)
}

// 🚀 FIXED: Lightweight native parser for Stripe's complex signed webhook payload signatures
function verifyStripeSignature(
  rawBody: string,
  signature: string | null,
  secret: string | undefined
): boolean {
  if (!signature || !secret) return false

  const parts = signature.split(",")
  const timestamp = parts.find((p) => p.startsWith("t="))?.split("=")[1]

  // 🚀 FIXED: Map down values cleanly and filter out undefined records
  const v1Signatures = parts
    .filter((p) => p.startsWith("v1="))
    .map((p) => p.split("=")[1])
    .filter((sig): sig is string => typeof sig === "string") // Guarantees array contains ONLY strings

  if (!timestamp || v1Signatures.length === 0) return false

  const signedPayload = `${timestamp}.${rawBody}`
  const computedHash = crypto
    .createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex")

  // 🚀 FIXED: TypeScript now recognizes v1Sig as an absolute, non-nullable string!
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
        if (payload.event === "charge.success") {
          providerReference = payload.data.reference
          shouldProcessTransaction = true
        }
      }
    } else if (flutterwaveSignature) {
      // Flutterwave utilizes plain text secret string hashes for standard matching checks
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
          providerReference = payload.data.tx_ref || payload.data.reference
          shouldProcessTransaction = true
        }
      }
    } else if (stripeSignature) {
      // 🚀 FIXED: Securely verifies Stripe signatures natively without requiring 'stripe' packages
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

    // 2. Clear security wall block early to prevent spoofing attempts
    if (!isVerified) {
      return NextResponse.json(
        { error: "Cryptographic signature validation failure" },
        { status: 401 }
      )
    }

    // 3. Early validation pass exit for unhandled webhook events (e.g. transfer.failed)
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
      const payment = await tx.payment.findFirst({
        where: {
          providerReference: providerReference,
          status: "PENDING",
        },
      })

      // 🚀 FIXED: Graceful 200 response ensures providers stop event re-try cycles
      if (!payment) {
        return {
          message:
            "Payment entry already handled or missing registration frame",
        }
      }

      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: { status: "SUCCESS" as any },
      })

      const updatedInvoice = await tx.invoice.update({
        where: { id: payment.invoiceId },
        data: { status: "PAID" as any },
      })

      return { updatedPayment, updatedInvoice }
    })

    return NextResponse.json({ received: true, result })
  } catch (error) {
    console.error("💥 SYSTEM CRITICAL: Webhook Route Fault:", error)
    return NextResponse.json(
      { error: "Webhook Processing Failed" },
      { status: 500 }
    )
  }
}
