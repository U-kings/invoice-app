// ... keep verification utilities identical

import { verifyStripeSignature, verifyWebhookSignature } from "@/lib/webhook-signature/verfiy-signature"
import { prisma } from "@repo/db"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()

    let isVerified = false
    let providerReference = ""
    let shouldProcessTransaction = false
    
    let webhookType: "INVOICE" | "SUBSCRIPTION" = "INVOICE" 
    let subscriptionAction: "ACTIVATE" | "CANCEL" = "ACTIVATE"
    let subscriptionData: { userId?: string; customerCode?: string; subscriptionCode?: string } = {}

    const paystackSignature = req.headers.get("x-paystack-signature")
    const stripeSignature = req.headers.get("stripe-signature")

    // ---------------------------------------------------------
    // 1. GATEWAY HANDSHAKE EVALUATION
    // ---------------------------------------------------------
    if (paystackSignature) {
      isVerified = await verifyWebhookSignature(rawBody, paystackSignature, process.env.PAYSTACK_SECRET_KEY, "sha512")

      if (isVerified) {
        const payload = JSON.parse(rawBody)
        
        if (payload.event === "charge.success" && payload.data?.status === "success") {
          if (payload.data.reference?.startsWith("SUB-PRO-")) {
            webhookType = "SUBSCRIPTION"
            subscriptionAction = "ACTIVATE"
            providerReference = payload.data.reference
            subscriptionData = {
              userId: payload.data.metadata?.userId,
              customerCode: payload.data.customer?.customer_code,
              subscriptionCode: payload.data.plan?.plan_code || payload.data.reference
            }
          } else {
            providerReference = payload.data.reference
            shouldProcessTransaction = true
          }
        }
        
        else if (payload.event === "subscription.create") {
          webhookType = "SUBSCRIPTION"
          subscriptionAction = "ACTIVATE"
          providerReference = payload.data.customer?.customer_code
          subscriptionData = {
            userId: payload.data.metadata?.userId,
            customerCode: payload.data.customer?.customer_code,
            subscriptionCode: payload.data.subscription_code
          }
        }

        else if (payload.event === "subscription.disable") {
          webhookType = "SUBSCRIPTION"
          subscriptionAction = "CANCEL"
          providerReference = payload.data.subscription_code
          subscriptionData = { userId: payload.data.metadata?.userId }
        }
      }
    } 
    
    else if (stripeSignature) {
      isVerified = verifyStripeSignature(rawBody, stripeSignature, process.env.STRIPE_WEBHOOK_SECRET)

      if (isVerified) {
        const payload = JSON.parse(rawBody)
        
        if (payload.type === "checkout.session.completed") {
          if (payload.data.object.mode === "subscription") {
            webhookType = "SUBSCRIPTION"
            subscriptionAction = "ACTIVATE"
            subscriptionData = {
              userId: payload.data.object.client_reference_id || payload.data.object.metadata?.userId,
              customerCode: payload.data.object.customer,
              subscriptionCode: payload.data.object.subscription
            }
          } else {
            providerReference = payload.data.object.id
            shouldProcessTransaction = true
          }
        }
        
        else if (payload.type === "customer.subscription.deleted") {
          webhookType = "SUBSCRIPTION"
          subscriptionAction = "CANCEL"
          subscriptionData = { customerCode: payload.data.object.customer }
        }
      }
    }

    if (!isVerified) {
      return NextResponse.json({ error: "Cryptographic signature validation failure" }, { status: 401 })
    }

    // ---------------------------------------------------------
    // 2. SUBSCRIPTION ENGINE CORE PROCESSING
    // ---------------------------------------------------------
    if (webhookType === "SUBSCRIPTION") {
      const { userId, customerCode, subscriptionCode } = subscriptionData
      const nextStatus = subscriptionAction === "ACTIVATE" ? "ACTIVE" : "CANCELLED"

      if (!userId) {
        // Find existing record via placeholder tracking IDs set during checkout initialization
        const existingSub = await prisma.subscription.findFirst({
          where: {
            OR: [
              { providerSubscriptionId: providerReference },
              { providerCustomerId: customerCode }
            ]
          }
        })
        
        if (!existingSub) throw new Error("Subscription mapping failed. Unable to identify user context.")
        
        const updatedSub = await prisma.subscription.update({
          where: { userId: existingSub.userId },
          data: {
            status: nextStatus as any,
            providerCustomerId: customerCode || existingSub.providerCustomerId,
            providerSubscriptionId: subscriptionCode || existingSub.providerSubscriptionId
          }
        })
        return NextResponse.json({ received: true, result: { status: nextStatus, updatedSub } })
      }

      const updatedSub = await prisma.subscription.update({
        where: { userId: userId },
        data: {
          status: nextStatus as any,
          providerCustomerId: customerCode || `CUST-${userId}`,
          providerSubscriptionId: subscriptionCode || `SUB-${userId}`
        }
      })

      return NextResponse.json({ received: true, result: { status: nextStatus, updatedSub } })
    }

    // Early exit for unhandled single-payment events
    if (!shouldProcessTransaction || !providerReference) {
      return NextResponse.json({ message: "Webhook processed gracefully" })
    }

    // ---------------------------------------------------------
    // 3. ATOMIC STANDARD INVOICES PROCESSING
    // ---------------------------------------------------------
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findFirst({ where: { providerReference } })
      if (!payment) throw new Error(`Payment entry reference [${providerReference}] not found.`)
      if (payment.status === "SUCCESS") return { status: "ALREADY_PROCESSED" }

      const updatedPayment = await tx.payment.update({ where: { id: payment.id }, data: { status: "SUCCESS" as any } })
      const updatedInvoice = await tx.invoice.update({ where: { id: payment.invoiceId }, data: { status: "PAID" as any } })
      return { updatedPayment, updatedInvoice, status: "NEWLY_PROCESSED" }
    })

    return NextResponse.json({ received: true, result }, { status: 200 })

  } catch (error: any) {
    console.error("💥 Webhook Route Fault:", error)
    if (error.message?.includes("not found") || error.message?.includes("mapping failed")) {
      return NextResponse.json({ error: error.message }, { status: 200 })
    }
    return NextResponse.json({ error: "Webhook Processing Failed" }, { status: 500 })
  }
}
