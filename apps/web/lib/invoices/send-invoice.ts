import { prisma } from "@repo/db"
import { resend } from "@/lib/email/resend"
import { InvoiceSentTemplate } from "../email/templates/invoice-sent"

export async function sendInvoice(invoiceId: string, userId: string) {
  // ---------------------------------------------
  // 1. Find invoice and verify ownership
  // ---------------------------------------------

  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      userId,
    },
    include: {
      customer: true,
      lineItems: true,
    },
  })

  if (!invoice) {
    throw new Error("Invoice not found")
  }

  // ---------------------------------------------
  // 2. Validate invoice status
  // ---------------------------------------------

  if (invoice.status === "SENT") {
    throw new Error("Invoice has already been sent")
  }

  if (invoice.status === "PAID") {
    throw new Error("A paid invoice cannot be sent")
  }

  if (invoice.status === "CANCELLED") {
    throw new Error("A cancelled invoice cannot be sent")
  }

  // ---------------------------------------------
  // 3. Validate customer email
  // ---------------------------------------------

  if (!invoice.customer.email) {
    throw new Error("Customer does not have an email address")
  }

  // ---------------------------------------------
  // 4. Calculate invoice total
  // ---------------------------------------------

  const subtotal = invoice.lineItems.reduce(
    (total, item) => total + Number(item.quantity) * Number(item.rate),
    0
  )

  const discountAmount = subtotal * (Number(invoice.discount) / 100)

  const taxableAmount = Math.max(0, subtotal - discountAmount)

  const taxAmount = taxableAmount * (Number(invoice.taxRate) / 100)

  const total = taxableAmount + taxAmount

  // ---------------------------------------------
  // 5. Send invoice email
  // ---------------------------------------------

  const invoiceUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invoice/${invoice.id}`

  const { error } = await resend.emails.send({
    from: "Invoice Flow <onboarding@resend.dev>",
    to: invoice.customer.email,
    subject: `Invoice ${invoice.invoiceNumber} from Invoice Flow`,

    html: InvoiceSentTemplate({
      invoice,
      invoiceUrl,
      total,
    }),
  })

  // ---------------------------------------------
  // 6. Don't update invoice if email failed
  // ---------------------------------------------

  if (error) {
    console.error("Resend error:", error)

    throw new Error("Failed to send invoice email")
  }

  // ---------------------------------------------
  // 7. Mark invoice as sent
  // ---------------------------------------------

  const sentInvoice = await prisma.invoice.update({
    where: {
      id: invoice.id,
    },

    data: {
      status: "SENT",
      sentAt: new Date(),
    },

    include: {
      customer: true,
      lineItems: true,
    },
  })

  // ---------------------------------------------
  // 8. Return updated invoice
  // ---------------------------------------------

  return sentInvoice
}
