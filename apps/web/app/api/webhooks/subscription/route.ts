// ... keep verification utilities identical
import { verifyStripeSignature, verifyWebhookSignature } from "@/lib/webhook-signature/verfiy-signature"
import { prisma } from "@repo/db"
import { NextRequest, NextResponse } from "next/server"
import { after } from "next/server" // 🚀 Crucial for Vercel Free-Tier execution

// -----------------------------------------------------------------------------
// BACKGROUND EXECUTION ENGINE (Runs after returning 200 OK)
// -----------------------------------------------------------------------------
async function handleBackgroundSubscription(subscriptionAction: "ACTIVATE" | "CANCEL", providerReference: string, subscriptionData: { userId?: string; customerCode?: string; subscriptionCode?: string }) {
  try {
    const { userId, customerCode, subscriptionCode } = subscriptionData
    const nextStatus = subscriptionAction === "ACTIVATE" ? "ACTIVE" : "CANCELLED"

    if (!userId) {
      const existingSub = await prisma.subscription.findFirst({
        where: {
          OR: [
            { providerSubscriptionId: providerReference },
            { providerCustomerId: customerCode }
          ]
        }
      })
      
      if (!existingSub) {
        console.error("❌ Subscription mapping failed. Unable to identify user context.");
        return;
      }
      
      await prisma.subscription.update({
        where: { userId: existingSub.userId },
        data: {
          status: nextStatus as any,
          providerCustomerId: customerCode || existingSub.providerCustomerId,
          providerSubscriptionId: subscriptionCode || existingSub.providerSubscriptionId
        }
      })
      console.log(`✅ Subscription asynchronously updated for missing-userId context.`);
      return;
    }

    await prisma.subscription.update({
      where: { userId: userId },
      data: {
        status: nextStatus as any,
        providerCustomerId: customerCode || `CUST-${userId}`,
        providerSubscriptionId: subscriptionCode || `SUB-${userId}`
      }
    })
    console.log(`✅ Subscription asynchronously updated for user: ${userId}`);
  } catch (error) {
    console.error("💥 Background Subscription Engine Fault:", error)
  }
}

async function handleBackgroundInvoiceTransaction(providerReference: string) {
  try {
    await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findFirst({ where: { providerReference } })
      if (!payment) {
        throw new Error(`Payment entry reference [${providerReference}] not found.`)
      }
      if (payment.status === "SUCCESS") {
        console.log(`ℹ️ Idempotency: reference [${providerReference}] already finalized.`);
        return;
      }

      await tx.payment.update({ where: { id: payment.id }, data: { status: "SUCCESS" as any } })
      await tx.invoice.update({ where: { id: payment.invoiceId }, data: { status: "PAID" as any } })
    })
    console.log(`✅ Invoice transaction atomically processed for ref: ${providerReference}`);
  } catch (error: any) {
    console.error("💥 Background Invoice Engine Fault:", error.message)
  }
}

// -----------------------------------------------------------------------------
// MAIN HTTP ROUTE HANDLER (Returns < 100ms)
// -----------------------------------------------------------------------------
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

    // 1. GATEWAY HANDSHAKE EVALUATION
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

    // 2. Reject unauthenticated gateway requests instantly
    if (!isVerified) {
      return NextResponse.json({ error: "Cryptographic signature validation failure" }, { status: 401 })
    }

    // 3. OFFLOAD PROCESSING TO BACKGROUND EXECUTIONS
    if (webhookType === "SUBSCRIPTION") {
      after(async () => {
        await handleBackgroundSubscription(subscriptionAction, providerReference, subscriptionData)
      })
      return NextResponse.json({ received: true, status: "Subscription operation queued" }, { status: 200 })
    }

    // Handle skip events gracefully
    if (!shouldProcessTransaction || !providerReference) {
      return NextResponse.json({ message: "Webhook processed gracefully" }, { status: 200 })
    }

    // Offload single invoice workflows
    after(async () => {
      await handleBackgroundInvoiceTransaction(providerReference)
    })

    // 4. RESPOND IMMEDIATELY TO PAYMENT SYSTEM
    return NextResponse.json({ received: true, status: "Invoice operation queued" }, { status: 200 })

  } catch (error: any) {
    console.error("💥 Webhook Route Fault:", error)
    return NextResponse.json({ error: "Webhook Processing Failed" }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic';
