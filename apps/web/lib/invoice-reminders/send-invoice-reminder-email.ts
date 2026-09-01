import type { InvoiceReminderType } from "@repo/db"
import { Resend } from "resend"

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
    (total, item) =>
      total + item.quantity * Number(item.rate),
    0
  )

  const discountAmount =
    subtotal * (Number(invoice.discount) / 100)

  const taxableAmount = Math.max(
    0,
    subtotal - discountAmount
  )

  const taxAmount =
    taxableAmount * (Number(invoice.taxRate) / 100)

  const total = taxableAmount + taxAmount

  // ---------------------------------------------
  // Reminder content
  // ---------------------------------------------

  const heading = getReminderHeading(type)

  const subject = getReminderSubject(
    type,
    invoice.invoiceNumber
  )

  const message = getReminderMessage(
    type,
    invoice.invoiceNumber,
    invoice.dueDate
  )

  // Use the public token for public invoice URLs.
  const invoiceUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invoice/${invoice.publicToken}`

  const formattedDueDate =
    new Intl.DateTimeFormat("en-US", {
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

    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>${subject}</title>
        </head>

        <body
          style="
            margin: 0;
            padding: 40px 16px;
            background-color: #f5f7f8;
            font-family: Arial, Helvetica, sans-serif;
            color: #172326;
          "
        >
          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
          >
            <tr>
              <td align="center">

                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="
                    max-width: 600px;
                    background: #ffffff;
                    border: 1px solid #e5e9ea;
                    border-radius: 16px;
                    overflow: hidden;
                  "
                >

                  <!-- Header -->

                  <tr>
                    <td
                      style="
                        padding: 28px 32px;
                        border-bottom: 1px solid #eef1f2;
                      "
                    >
                      <strong
                        style="
                          font-size: 20px;
                          color: #172326;
                        "
                      >
                        Invoice Flow
                      </strong>
                    </td>
                  </tr>

                  <!-- Content -->

                  <tr>
                    <td style="padding: 40px 32px 32px;">

                      <p
                        style="
                          margin: 0 0 10px;
                          font-size: 14px;
                          color: #6b777a;
                        "
                      >
                        Hello ${invoice.customer.name},
                      </p>

                      <h1
                        style="
                          margin: 0;
                          font-size: 28px;
                          line-height: 1.25;
                          color: #172326;
                        "
                      >
                        ${heading}
                      </h1>

                      <p
                        style="
                          margin: 14px 0 28px;
                          font-size: 15px;
                          line-height: 1.6;
                          color: #667276;
                        "
                      >
                        ${message}
                      </p>

                      <!-- Invoice Summary -->

                      <table
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                        style="
                          background: #f8fafb;
                          border: 1px solid #e8edef;
                          border-radius: 12px;
                        "
                      >
                        <tr>
                          <td style="padding: 22px 24px;">

                            <!-- Invoice Number -->

                            <p
                              style="
                                margin: 0 0 8px;
                                font-size: 13px;
                                color: #718083;
                              "
                            >
                              Invoice number
                            </p>

                            <p
                              style="
                                margin: 0 0 20px;
                                font-size: 15px;
                                font-weight: 600;
                                color: #172326;
                              "
                            >
                              ${invoice.invoiceNumber}
                            </p>

                            <!-- Amount Due -->

                            <p
                              style="
                                margin: 0 0 8px;
                                font-size: 13px;
                                color: #718083;
                              "
                            >
                              Amount due
                            </p>

                            <p
                              style="
                                margin: 0 0 20px;
                                font-size: 22px;
                                font-weight: 700;
                                color: #172326;
                              "
                            >
                              ${invoice.currency}
                              ${total.toFixed(2)}
                            </p>

                            <!-- Due Date -->

                            <p
                              style="
                                margin: 0 0 8px;
                                font-size: 13px;
                                color: #718083;
                              "
                            >
                              Due date
                            </p>

                            <p
                              style="
                                margin: 0;
                                font-size: 15px;
                                font-weight: 600;
                                color: #172326;
                              "
                            >
                              ${formattedDueDate}
                            </p>

                          </td>
                        </tr>
                      </table>

                      <!-- CTA -->

                      <table
                        width="100%"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                        style="margin-top: 28px;"
                      >
                        <tr>
                          <td align="center">

                            <a
                              href="${invoiceUrl}"
                              style="
                                display: block;
                                padding: 15px 24px;
                                background: #2eafb4;
                                color: #ffffff;
                                text-decoration: none;
                                text-align: center;
                                font-size: 15px;
                                font-weight: 700;
                                border-radius: 9px;
                              "
                            >
                              Review &amp; Pay Invoice
                            </a>

                          </td>
                        </tr>
                      </table>

                    </td>
                  </tr>

                  <!-- Footer -->

                  <tr>
                    <td
                      style="
                        padding: 24px 32px;
                        background: #fafbfb;
                        border-top: 1px solid #eef1f2;
                        text-align: center;
                        font-size: 12px;
                        color: #8a9699;
                      "
                    >
                      This email was sent by Invoice Flow.
                    </td>
                  </tr>

                </table>

              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
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

function getReminderSubject(
  type: InvoiceReminderType,
  invoiceNumber: string
) {
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
  const formattedDueDate =
    new Intl.DateTimeFormat("en-US", {
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