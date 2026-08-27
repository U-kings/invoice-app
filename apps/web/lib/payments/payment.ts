import { prisma } from "@repo/db"
import { paymentRouter } from "@workspace/payment-adapters"

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
    result = await provider.createCheckout({
      invoiceId: invoice.id,
      amount: total,
      currency: invoice.currency || "NGN",
      customer: {
        name: invoice.customer.name,
        email: invoice.customer.email,
      },
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pay/${invoice.id}/success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pay/${invoice.id}`,
    })
    console.log("✅ Gateway initialized checkout successfully:", result)
  } catch (gatewayError: any) {
    // =================================================================
    // 🚀 EXPOSURE CATCHER 1: The external API call failed!
    // =================================================================
    console.error(
      `💥 FAILURE CAUGHT INSIDE ADAPTER: [${provider.name.toUpperCase()}]`
    )
    console.error(
      "The network fetch inside the adapter returned HTML text instead of JSON."
    )
    console.error("Error signature details:", gatewayError)
    throw new Error(
      `[Adapter Error - ${provider.name}]: ${gatewayError.message}`
    )
  }

  // =========================================================
  // 3. PERSISTENCE STEP: Save the transaction to your Payment table
  // =========================================================
  // =================================================================
  // 🚀 PERSISTENCE STEP: Guard check + Save log & Mark Invoice as PAID
  // =================================================================
  try {
    const { payment, updatedInvoice } = await prisma.$transaction(
      async (tx) => {
        // 1. 🚀 DEFENSIVE GUARD CHECK: Look for any pre-existing successful payment references
        const existingSuccessfulPayment = await tx.payment.findFirst({
          where: {
            invoiceId: invoice.id,
            status: "SUCCESS", // Handles potential variation mappings in your Enum
          },
        })

        // If this transaction was already finalized via a webhook background check, stand down immediately
        if (existingSuccessfulPayment) {
          console.log(
            `⚠️ Prevented double-write: Invoice ${invoice.id} has already been settled via reference ${existingSuccessfulPayment.providerReference}.`
          )
          return { payment: existingSuccessfulPayment, updatedInvoice: invoice }
        }

        // 2. Log the transaction details inside your Payment schema table if it's completely new
        const newPayment = await tx.payment.create({
          data: {
            invoiceId: invoice.id,
            provider: result.provider?.toUpperCase() as any,
            providerReference: result.reference,
            amount: total,
            currency: invoice.currency || "NGN",
            checkoutUrl: result.checkoutUrl || result.url,
            status: "PENDING", // Initial link generated state
          },
        })

        // 3. Cascade update your parent Invoice state workflow cleanly
        const newInvoice = await tx.invoice.update({
          where: { id: invoice.id },
          data: {
            status: "PAID", // Syncs status matching your schema's Enum syntax
          },
        })

        return { payment: newPayment, updatedInvoice: newInvoice }
      }
    )

    console.log(
      `✅ Database records synced atomically. Invoice ${invoice.id} status resolution: ${updatedInvoice.status}`
    )
  } catch (prismaError: any) {
    // =================================================================
    // 🚀 EXPOSURE CATCHER 2: The database write failed!
    // =================================================================
    console.error("💥 FAILURE CAUGHT INSIDE DATABASE PERSISTENCE PASS!")
    console.error("Prisma atomic transaction threw a mapping exception:")
    console.error(prismaError)
    throw new Error(
      `[Database Transaction Error]: Sourcing failed during records persistence pass.`
    )
  }

  return result
}
