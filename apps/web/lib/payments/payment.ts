import { prisma } from "@repo/db"
import { paymentRouter } from "@workspace/payment-adapters"
import { decryptSecret } from "../security/encryption"

export async function createCheckout(
  invoiceId: string,
  businessCountry: string,
  customerCountry: string
) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      customer: true,
      user: true,
      lineItems: true,
    },
  })

  if (!invoice) throw new Error("Invoice not found")
  if (invoice.status !== "SENT")
    throw new Error("Only sent invoices can be paid")

  const subtotal = invoice.lineItems.reduce(
    (sum, item) => sum + Number(item.rate) * item.quantity,
    0
  )

  const discountRate = Number(invoice.discount || 0)
  const discountAmount = subtotal * (discountRate / 100)
  const taxableAmount = Math.max(subtotal - discountAmount, 0)
  const tax = taxableAmount * (Number(invoice.taxRate) / 100)
  const total = taxableAmount + tax

  // 1. Dynamic routing selection
  const provider = paymentRouter.resolve({
    currency: invoice.currency || "NGN",
    businessCountry,
    customerCountry,
  })

  console.log(
    `➡️ Resolved adapter name to invoke: [${provider.name.toUpperCase()}]`
  )

  // 2. Call your polymorphic interface strategy to get checkout url
  let result: any
  try {
    const connection = await prisma.paymentProviderConnection.findUnique({
      where: {
        userId_provider: {
          userId: invoice.userId,
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
      throw new Error("Paystack is not connected for this account.")
    }

    const paystackSecret = decryptSecret(connection.encryptedSecretKey)

    result = await provider.createCheckout({
      invoiceId: invoice.id,
      amount: total,
      currency: invoice.currency || "NGN",
      customer: {
        name: invoice.customer.name,
        email: invoice.customer.email,
      },
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pay/${invoice.publicToken}/success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pay/${invoice.publicToken}`,
      paystackSecret,
    })
    console.log("✅ Gateway initialized checkout successfully:", result)
  } catch (gatewayError: any) {
    console.error(
      `💥 FAILURE CAUGHT INSIDE ADAPTER: [${provider.name.toUpperCase()}]`
    )
    console.error("Error signature details:", gatewayError)
    throw new Error(
      `[Adapter Error - ${provider.name}]: ${gatewayError.message}`
    )
  }

  // 3. PERSISTENCE STEP: Save initial PENDING payment link record.
  // DO NOT change the Invoice status to PAID here.
  try {
    const { payment } = await prisma.$transaction(async (tx) => {
      // Defensive check for an already settled payment
      const existingSuccessfulPayment = await tx.payment.findFirst({
        where: {
          invoiceId: invoice.id,
          status: "SUCCESS",
        },
      })

      if (existingSuccessfulPayment) {
        console.log(
          `⚠️ Prevented double-write: Invoice ${invoice.id} has already been settled.`
        )
        return { payment: existingSuccessfulPayment }
      }

      // Log the newly generated checkout attempt as PENDING
      const newPayment = await tx.payment.create({
        data: {
          invoiceId: invoice.id,
          provider: result.provider?.toUpperCase() as any,
          providerReference: result.reference,
          amount: total,
          currency: invoice.currency || "NGN",
          checkoutUrl: result.checkoutUrl || result.url,
          status: "PENDING", // Correctly captures initial link generated state
        },
      })

      // REMOVED: Invoice status remains "SENT" while waiting for user interaction

      return { payment: newPayment }
    })

    console.log(
      `✅ PENDING payment link record tracked for Invoice ${invoice.id}`
    )
  } catch (prismaError: any) {
    console.error("💥 FAILURE CAUGHT INSIDE DATABASE PERSISTENCE PASS!")
    console.error(prismaError)
    throw new Error(
      `[Database Transaction Error]: Sourcing failed during records persistence pass.`
    )
  }

  return result
}
