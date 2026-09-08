import {
  verifyStripeSignature,
  verifyWebhookSignature,
} from "@/lib/webhook-signature/verfiy-signature"
import { prisma } from "@repo/db"
import { after, NextRequest, NextResponse } from "next/server"

type SubscriptionData = {
  userId?: string
  customerCode?: string
  subscriptionCode?: string
}

type SubscriptionAction = "ACTIVATE" | "MARK_NON_RENEWING" | "CANCEL"

async function findSubscription(
  data: SubscriptionData,
  providerReference?: string
) {
  const { userId, customerCode, subscriptionCode } = data

  if (userId) {
    const subscription = await prisma.subscription.findUnique({
      where: {
        userId,
      },
    })

    if (subscription) {
      return subscription
    }
  }

  const identifiers = [
    providerReference,
    customerCode,
    subscriptionCode,
  ].filter(Boolean) as string[]

  if (identifiers.length === 0) {
    return null
  }

  return prisma.subscription.findFirst({
    where: {
      OR: [
        ...identifiers.map((value) => ({
          providerSubscriptionId: value,
        })),
        ...identifiers.map((value) => ({
          providerCustomerId: value,
        })),
      ],
    },
  })
}

async function handleSubscriptionEvent(
  action: SubscriptionAction,
  providerReference: string,
  subscriptionData: SubscriptionData
) {
  try {
    const subscription = await findSubscription(
      subscriptionData,
      providerReference
    )

    if (!subscription) {
      console.error("Subscription mapping failed.", {
        action,
        providerReference,
        subscriptionData,
      })

      return
    }

    const { customerCode, subscriptionCode } = subscriptionData

    if (action === "ACTIVATE") {
      await prisma.subscription.update({
        where: {
          id: subscription.id,
        },
        data: {
          plan: "PRO",
          status: "ACTIVE",
          cancelAtPeriodEnd: false,
          cancelledAt: null,

          ...(customerCode
            ? {
                providerCustomerId: customerCode,
              }
            : {}),

          ...(subscriptionCode
            ? {
                providerSubscriptionId: subscriptionCode,
              }
            : {}),
        },
      })

      console.log(`Subscription activated for user ${subscription.userId}`)

      return
    }

    if (action === "MARK_NON_RENEWING") {
      await prisma.subscription.update({
        where: {
          id: subscription.id,
        },
        data: {
          cancelAtPeriodEnd: true,

          ...(customerCode
            ? {
                providerCustomerId: customerCode,
              }
            : {}),

          ...(subscriptionCode
            ? {
                providerSubscriptionId: subscriptionCode,
              }
            : {}),
        },
      })

      console.log(
        `Subscription marked for cancellation at period end for user ${subscription.userId}`
      )

      return
    }

    if (action === "CANCEL") {
      await prisma.subscription.update({
        where: {
          id: subscription.id,
        },
        data: {
          status: "CANCELLED",
          cancelAtPeriodEnd: false,
          cancelledAt: new Date(),

          ...(customerCode
            ? {
                providerCustomerId: customerCode,
              }
            : {}),

          ...(subscriptionCode
            ? {
                providerSubscriptionId: subscriptionCode,
              }
            : {}),
        },
      })

      console.log(`Subscription cancelled for user ${subscription.userId}`)
    }
  } catch (error) {
    console.error("Background subscription processing error:", error)
  }
}

async function handleSubscriptionBillingTransaction(
  providerReference: string,
  payload: any
) {
  try {
    const data = payload.data

    const customerCode = data?.customer?.customer_code ?? null

    const subscriptionCode =
      data?.subscription?.subscription_code ?? data?.subscription?.code ?? null

    const userId = data?.metadata?.userId ?? null

    const subscription = await findSubscription({
      userId: userId ?? undefined,
      customerCode: customerCode ?? undefined,
      subscriptionCode: subscriptionCode ?? undefined,
    })

    if (!subscription) {
      console.error("Unable to map subscription payment to a user.", {
        providerReference,
        customerCode,
        subscriptionCode,
        userId,
      })

      return
    }

    const existingTransaction = await prisma.billingTransaction.findFirst({
      where: {
        OR: [
          {
            providerTransactionId: providerReference,
          },
          {
            providerReference,
          },
        ],
      },
    })

    if (existingTransaction) {
      console.log(`Billing transaction already exists for ${providerReference}`)

      return
    }

    const amount = Number(data?.amount ?? 0) / 100

    await prisma.billingTransaction.create({
      data: {
        userId: subscription.userId,
        subscriptionId: subscription.id,
        provider: "paystack",

        providerTransactionId:
          data?.id != null ? String(data.id) : providerReference,

        providerReference,

        amount,
        currency: data?.currency ?? "NGN",

        status: "SUCCESS",

        description: "Invoice Flow Pro subscription payment",

        paidAt: data?.paid_at ? new Date(data.paid_at) : new Date(),
      },
    })

    console.log(`Billing transaction created for ${providerReference}`)
  } catch (error) {
    console.error("Background subscription billing transaction error:", error)
  }
}

async function handleInvoiceTransaction(providerReference: string) {
  try {
    await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findFirst({
        where: {
          providerReference,
        },
      })

      if (!payment) {
        throw new Error(
          `Payment entry reference [${providerReference}] not found.`
        )
      }

      if (payment.status === "SUCCESS") {
        console.log(
          `Idempotency: invoice payment [${providerReference}] already finalized.`
        )

        return
      }

      await tx.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          status: "SUCCESS",
        },
      })

      await tx.invoice.update({
        where: {
          id: payment.invoiceId,
        },
        data: {
          status: "PAID",
        },
      })
    })

    console.log(`Invoice transaction processed for ${providerReference}`)
  } catch (error) {
    console.error("Background invoice transaction error:", error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()

    let isVerified = false

    let providerReference = ""

    let webhookType: "INVOICE" | "SUBSCRIPTION" = "INVOICE"

    let subscriptionAction: SubscriptionAction = "ACTIVATE"

    let subscriptionData: SubscriptionData = {}

    let shouldProcessInvoice = false
    let shouldProcessSubscriptionPayment = false

    const paystackSignature = req.headers.get("x-paystack-signature")

    const stripeSignature = req.headers.get("stripe-signature")

    /*
     * PAYSTACK
     */
    if (paystackSignature) {
      isVerified = await verifyWebhookSignature(
        rawBody,
        paystackSignature,
        process.env.PAYSTACK_SECRET_KEY,
        "sha512"
      )

      if (isVerified) {
        const payload = JSON.parse(rawBody)

        switch (payload.event) {
          /*
           * Initial subscription payment
           * and recurring subscription payments.
           */
          case "charge.success": {
            providerReference = payload.data?.reference ?? ""

            const metadataUserId = payload.data?.metadata?.userId

            const customerCode = payload.data?.customer?.customer_code

            const subscriptionCode =
              payload.data?.subscription?.subscription_code ??
              payload.data?.plan?.plan_code

            const isSubscriptionCharge = Boolean(
              metadataUserId ||
              subscriptionCode ||
              (typeof providerReference === "string" &&
                providerReference.startsWith("SUB-PRO-"))
            )

            if (isSubscriptionCharge) {
              webhookType = "SUBSCRIPTION"

              subscriptionAction = "ACTIVATE"

              subscriptionData = {
                userId: metadataUserId,
                customerCode,
                subscriptionCode,
              }

              shouldProcessSubscriptionPayment = true
            } else {
              shouldProcessInvoice = true
            }

            break
          }

          /*
           * Paystack has created the recurring
           * subscription.
           *
           * This does NOT create a BillingTransaction.
           */
          case "subscription.create": {
            webhookType = "SUBSCRIPTION"

            subscriptionAction = "ACTIVATE"

            providerReference =
              payload.data?.subscription_code ??
              payload.data?.customer?.customer_code ??
              ""

            subscriptionData = {
              userId: payload.data?.metadata?.userId,

              customerCode: payload.data?.customer?.customer_code,

              subscriptionCode: payload.data?.subscription_code,
            }

            break
          }

          /*
           * User cancelled through Paystack's
           * subscription management page.
           *
           * Pro access continues until the
           * current billing period ends.
           */
          case "subscription.not_renew": {
            webhookType = "SUBSCRIPTION"

            subscriptionAction = "MARK_NON_RENEWING"

            providerReference =
              payload.data?.subscription_code ??
              payload.data?.customer?.customer_code ??
              ""

            subscriptionData = {
              userId: payload.data?.metadata?.userId,

              customerCode: payload.data?.customer?.customer_code,

              subscriptionCode: payload.data?.subscription_code,
            }

            break
          }

          /*
           * Subscription has actually ended.
           */
          case "subscription.disable": {
            webhookType = "SUBSCRIPTION"

            subscriptionAction = "CANCEL"

            providerReference =
              payload.data?.subscription_code ??
              payload.data?.customer?.customer_code ??
              ""

            subscriptionData = {
              userId: payload.data?.metadata?.userId,

              customerCode: payload.data?.customer?.customer_code,

              subscriptionCode: payload.data?.subscription_code,
            }

            break
          }

          default:
            break
        }
      }
    }

    /*
     * STRIPE
     *
     * Keep the existing Stripe support.
     */
    else if (stripeSignature) {
      isVerified = verifyStripeSignature(
        rawBody,
        stripeSignature,
        process.env.STRIPE_WEBHOOK_SECRET
      )

      if (isVerified) {
        const payload = JSON.parse(rawBody)

        if (payload.type === "checkout.session.completed") {
          if (payload.data.object.mode === "subscription") {
            webhookType = "SUBSCRIPTION"

            subscriptionAction = "ACTIVATE"

            subscriptionData = {
              userId:
                payload.data.object.client_reference_id ??
                payload.data.object.metadata?.userId,

              customerCode: payload.data.object.customer,

              subscriptionCode: payload.data.object.subscription,
            }

            providerReference = payload.data.object.id

            shouldProcessSubscriptionPayment = true
          } else {
            providerReference = payload.data.object.id

            shouldProcessInvoice = true
          }
        } else if (payload.type === "customer.subscription.deleted") {
          webhookType = "SUBSCRIPTION"

          subscriptionAction = "CANCEL"

          subscriptionData = {
            customerCode: payload.data.object.customer,

            subscriptionCode: payload.data.object.id,
          }
        }
      }
    }

    /*
     * Signature verification failed.
     */
    if (!isVerified) {
      return NextResponse.json(
        {
          error: "Cryptographic signature validation failure",
        },
        { status: 401 }
      )
    }

    /*
     * SUBSCRIPTION
     */
    if (webhookType === "SUBSCRIPTION") {
      after(async () => {
        await handleSubscriptionEvent(
          subscriptionAction,
          providerReference,
          subscriptionData
        )

        if (shouldProcessSubscriptionPayment) {
          const payload = JSON.parse(rawBody)

          await handleSubscriptionBillingTransaction(providerReference, payload)
        }
      })

      return NextResponse.json(
        {
          received: true,
          status: "Subscription operation queued",
        },
        { status: 200 }
      )
    }

    /*
     * INVOICE PAYMENT
     */
    if (shouldProcessInvoice && providerReference) {
      after(async () => {
        await handleInvoiceTransaction(providerReference)
      })

      return NextResponse.json(
        {
          received: true,
          status: "Invoice operation queued",
        },
        { status: 200 }
      )
    }

    /*
     * Events we don't currently need to process.
     */
    return NextResponse.json(
      {
        received: true,
        status: "Webhook processed gracefully",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Webhook route fault:", error)

    return NextResponse.json(
      {
        error: "Webhook Processing Failed",
      },
      { status: 500 }
    )
  }
}

export const dynamic = "force-dynamic"
