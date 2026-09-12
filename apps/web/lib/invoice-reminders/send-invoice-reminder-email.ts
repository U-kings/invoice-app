import type { InvoiceReminderType } from "@repo/db"
import { InvoiceReminderTemplate } from "../email/templates/invoice-reminder"

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

  // 1. Calculate invoice total
  const subtotal = invoice.lineItems.reduce(
    (total, item) => total + item.quantity * Number(item.rate),
    0
  )
  const discountAmount = subtotal * (Number(invoice.discount) / 100)
  const taxableAmount = Math.max(0, subtotal - discountAmount)
  const taxAmount = taxableAmount * (Number(invoice.taxRate) / 100)
  const total = taxableAmount + taxAmount

  // 2. Generate text copies based on reminder status
  const heading = getReminderHeading(type)
  const subject = getReminderSubject(type, invoice.invoiceNumber)
  const message = getReminderMessage(type, invoice.invoiceNumber, invoice.dueDate)

  const invoiceUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invoice/${invoice.publicToken}`
  const formattedDueDate = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(invoice.dueDate)

  // 3. Render the dynamic HTML template string
  const htmlContent = InvoiceReminderTemplate({
    subject,
    heading,
    message,
    formattedDueDate,
    invoice,
    total,
    invoiceUrl,
  })

  // 4. Verify config and deliver via Brevo API
  const brevoApiKey = process.env.BREVO_API_KEY

  if (!brevoApiKey) {
    console.error("BREVO_CONFIG_ERROR: BREVO_API_KEY environment variable is missing.")
    throw new Error("Email configuration error.")
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "api-key": brevoApiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: { 
        name: "Invoice Flow", 
        email: "kingsleyigbokwe909@gmail.com" // 👈 Swap this with your verified sender email in Brevo
      },
      to: [{ email: invoice.customer.email }],
      replyTo: { email: user.email },
      subject,
      htmlContent,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error("Brevo API error:", errorData)
    throw new Error("Failed to send invoice reminder email")
  }

  return {
    success: true,
  }
}

// ---------------------------------------------
// Helper Methods for Content Copy Mapping
// ---------------------------------------------

function getReminderHeading(type: InvoiceReminderType) {
  switch (type) {
    case "BEFORE_DUE": return "Your invoice is due soon"
    case "DUE_DATE": return "Your invoice is due today"
    case "OVERDUE": return "Your invoice is overdue"
  }
}

function getReminderSubject(type: InvoiceReminderType, invoiceNumber: string) {
  switch (type) {
    case "BEFORE_DUE": return `Reminder: Invoice ${invoiceNumber} is due soon`
    case "DUE_DATE": return `Invoice ${invoiceNumber} is due today`
    case "OVERDUE": return `Reminder: Invoice ${invoiceNumber} is overdue`
  }
}

function getReminderMessage(type: InvoiceReminderType, invoiceNumber: string, dueDate: Date) {
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
