import { prisma } from "@repo/db"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

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
    (total, item) =>
      total + Number(item.quantity) * Number(item.rate),
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

    html: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Invoice ${invoice.invoiceNumber}</title>
      </head>

      <body
        style="
          margin: 0;
          padding: 0;
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
          style="background-color: #f5f7f8; padding: 40px 16px;"
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
                  background-color: #ffffff;
                  border-radius: 16px;
                  overflow: hidden;
                  border: 1px solid #e5e9ea;
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
                    <table
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                    >
                      <tr>
                        <td>
                          <div
                            style="
                              font-size: 20px;
                              font-weight: 700;
                              color: #172326;
                            "
                          >
                            Invoice Flow
                          </div>
                        </td>

                        <td
                          align="right"
                          style="
                            font-size: 13px;
                            color: #6b777a;
                          "
                        >
                          Invoice
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Main content -->
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
                      Your invoice is ready
                    </h1>

                    <p
                      style="
                        margin: 14px 0 28px;
                        font-size: 15px;
                        line-height: 1.6;
                        color: #667276;
                      "
                    >
                      You have received a new invoice from Invoice Flow.
                      Review the details below and complete your payment
                      securely online.
                    </p>

                    <!-- Invoice summary -->
                    <table
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      style="
                        background-color: #f8fafb;
                        border: 1px solid #e8edef;
                        border-radius: 12px;
                      "
                    >
                      <tr>
                        <td style="padding: 22px 24px;">

                          <table
                            width="100%"
                            cellpadding="0"
                            cellspacing="0"
                            border="0"
                          >

                            <tr>
                              <td
                                style="
                                  padding-bottom: 16px;
                                  font-size: 13px;
                                  color: #718083;
                                "
                              >
                                Invoice number
                              </td>

                              <td
                                align="right"
                                style="
                                  padding-bottom: 16px;
                                  font-size: 14px;
                                  font-weight: 600;
                                  color: #172326;
                                "
                              >
                                ${invoice.invoiceNumber}
                              </td>
                            </tr>

                            <tr>
                              <td
                                style="
                                  padding-bottom: 16px;
                                  font-size: 13px;
                                  color: #718083;
                                "
                              >
                                Amount due
                              </td>

                              <td
                                align="right"
                                style="
                                  padding-bottom: 16px;
                                  font-size: 22px;
                                  font-weight: 700;
                                  color: #172326;
                                "
                              >
                                ${invoice.currency} ${total.toFixed(2)}
                              </td>
                            </tr>

                            <tr>
                              <td
                                style="
                                  font-size: 13px;
                                  color: #718083;
                                "
                              >
                                Due date
                              </td>

                              <td
                                align="right"
                                style="
                                  font-size: 14px;
                                  font-weight: 600;
                                  color: #172326;
                                "
                              >
                                ${invoice.dueDate.toLocaleDateString()}
                              </td>
                            </tr>

                          </table>

                        </td>
                      </tr>
                    </table>

                    <!-- Payment CTA -->
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
                              display: inline-block;
                              width: 100%;
                              box-sizing: border-box;
                              padding: 15px 24px;
                              background-color: #2eafb4;
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

                    <p
                      style="
                        margin: 18px 0 0;
                        text-align: center;
                        font-size: 12px;
                        line-height: 1.5;
                        color: #8a9699;
                      "
                    >
                      You can review the invoice and payment details
                      securely using the button above.
                    </p>

                    <!-- Divider -->
                    <div
                      style="
                        height: 1px;
                        background-color: #edf0f1;
                        margin: 32px 0 24px;
                      "
                    ></div>

                    <p
                      style="
                        margin: 0;
                        font-size: 13px;
                        line-height: 1.6;
                        color: #697679;
                      "
                    >
                      If you have any questions about this invoice,
                      please contact the sender directly.
                    </p>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td
                    style="
                      padding: 24px 32px;
                      background-color: #fafbfb;
                      border-top: 1px solid #eef1f2;
                    "
                  >
                    <p
                      style="
                        margin: 0;
                        text-align: center;
                        font-size: 12px;
                        line-height: 1.5;
                        color: #8a9699;
                      "
                    >
                      This email was sent by Invoice Flow.
                    </p>

                    <p
                      style="
                        margin: 8px 0 0;
                        text-align: center;
                        font-size: 12px;
                        color: #a0aaad;
                      "
                    >
                      Please do not reply to this automated email.
                    </p>
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
