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
  if (invoice.status !== "SENT") throw new Error("Only sent invoices can be paid")

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

  // 2. Call your polymorphic interface strategy to get checkout url
  const result = await provider.createCheckout({
    invoiceId: invoice.id,
    amount: total,
    currency: invoice.currency || "NGN",
    customer: {
      name: invoice.customer.name,
      email: invoice.customer.email,
    },
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/invoices/${invoice.id}/success`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/invoices/${invoice.id}`,
  })

  // =========================================================
  // 3. PERSISTENCE STEP: Save the transaction to your Payment table
  // =========================================================
  await prisma.payment.create({
    data: {
      invoiceId: invoice.id,
      // Map string names to your schema's PaymentProvider Enum uppercase values safely
      provider: result.provider.toUpperCase() as any, 
      providerReference: result.reference,
      amount: total,
      currency: invoice.currency || "NGN",
      checkoutUrl: result.checkoutUrl,
      status: "PENDING", // Matches your schema default
    },
  })

  return result // Safely passes back { provider, checkoutUrl, reference }
}
