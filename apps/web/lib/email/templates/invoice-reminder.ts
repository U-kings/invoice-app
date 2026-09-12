type InvoiceReminderTemplateProps = {
  subject: string
  heading: string
  message: string
  formattedDueDate: string
  invoice: {
    invoiceNumber: string
    currency: string
    dueDate: Date
    customer: {
      name: string
    }
  }
  total: number
  invoiceUrl: string
}

export const InvoiceReminderTemplate = ({
  subject,
  heading,
  message,
  formattedDueDate,
  invoice,
  total,
  invoiceUrl,
}: InvoiceReminderTemplateProps) => {
  return `
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
    `
}
