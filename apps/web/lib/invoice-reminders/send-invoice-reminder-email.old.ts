import type { InvoiceReminderType } from "@repo/db"
import { Resend } from "resend"
import { InvoiceReminderTemplate } from "../email/templates/invoice-reminder"

const resend = new Resend(process.env.RESEND_API_KEY)

type ReminderWithRelations = {
  id: string
  userId: string
  type: InvoiceReminderType
  scheduledFor: Date

  invoice: {
    id: string
    invoiceNumber: string
    publicToken: string
    currency: string
    dueDate: Date
    discount: unknown
    taxRate: unknown

    customer: {
      name: string
      email: string | null
    }

    lineItems: Array<{
      quantity: number
      rate: unknown
    }>
  }

  user: {
    email: string
  }
}

type SendInvoiceReminderEmailParams = {
  reminder: ReminderWithRelations
}

export async function sendInvoiceReminderEmail({
  reminder,
}: SendInvoiceReminderEmailParams) {
  const { invoice, user, type } = reminder

  if (!invoice.customer.email) {
    throw new Error("Customer does not have an email address")
  }

  // ---------------------------------------------
  // Calculate invoice total
  // ---------------------------------------------

  const subtotal = invoice.lineItems.reduce(
    (total, item) => total + item.quantity * Number(item.rate),
    0
  )

  const discountAmount = subtotal * (Number(invoice.discount) / 100)

  const taxableAmount = Math.max(0, subtotal - discountAmount)

  const taxAmount = taxableAmount * (Number(invoice.taxRate) / 100)

  const total = taxableAmount + taxAmount

  // ---------------------------------------------
  // Reminder content
  // ---------------------------------------------

  const heading = getReminderHeading(type)

  const subject = getReminderSubject(type, invoice.invoiceNumber)

  const message = getReminderMessage(
    type,
    invoice.invoiceNumber,
    invoice.dueDate
  )

  // Use the public token for public invoice URLs.
  const invoiceUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invoice/${invoice.publicToken}`

  const formattedDueDate = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(invoice.dueDate)

  // ---------------------------------------------
  // Send email
  // ---------------------------------------------

  const { error } = await resend.emails.send({
    from: "Invoice Flow <onboarding@resend.dev>",
    to: invoice.customer.email,
    replyTo: user.email,
    subject,

    html: InvoiceReminderTemplate({
      subject,
      heading,
      message,
      formattedDueDate,
      invoice,
      total,
      invoiceUrl,
    }),
  })

  if (error) {
    console.error("Invoice reminder email error:", error)

    throw new Error("Failed to send invoice reminder email")
  }

  return {
    success: true,
  }
}

// ---------------------------------------------
// Reminder heading
// ---------------------------------------------

function getReminderHeading(type: InvoiceReminderType) {
  switch (type) {
    case "BEFORE_DUE":
      return "Your invoice is due soon"

    case "DUE_DATE":
      return "Your invoice is due today"

    case "OVERDUE":
      return "Your invoice is overdue"
  }
}

// ---------------------------------------------
// Reminder subject
// ---------------------------------------------

function getReminderSubject(type: InvoiceReminderType, invoiceNumber: string) {
  switch (type) {
    case "BEFORE_DUE":
      return `Reminder: Invoice ${invoiceNumber} is due soon`

    case "DUE_DATE":
      return `Invoice ${invoiceNumber} is due today`

    case "OVERDUE":
      return `Reminder: Invoice ${invoiceNumber} is overdue`
  }
}

// ---------------------------------------------
// Reminder message
// ---------------------------------------------

function getReminderMessage(
  type: InvoiceReminderType,
  invoiceNumber: string,
  dueDate: Date
) {
  const formattedDueDate = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(dueDate)

  switch (type) {
    case "BEFORE_DUE":
      return `This is a reminder that invoice ${invoiceNumber} is due on ${formattedDueDate}.`

    case "DUE_DATE":
      return `Invoice ${invoiceNumber} is due today. Please review the invoice and complete your payment.`

    case "OVERDUE":
      return `Invoice ${invoiceNumber} was due on ${formattedDueDate} and is currently overdue. Please review the invoice and complete your payment.`
  }
}
