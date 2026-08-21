import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import { NextResponse } from "next/server"
import { prisma } from "@repo/db"

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      publicToken: string
    }>
  }
) {
  try {
    const { publicToken } = await params

    if (!publicToken) {
      return NextResponse.json(
        {
          error: "Public invoice token is required.",
        },
        {
          status: 400,
        }
      )
    }

    const invoice = await prisma.invoice.findUnique({
      where: {
        publicToken,
      },
      include: {
        customer: true,
        lineItems: true,
      },
    })

    if (!invoice) {
      return NextResponse.json(
        {
          error: "Invoice not found.",
        },
        {
          status: 404,
        }
      )
    }

    /*
     * Only allow invoices that are supposed
     * to be publicly accessible.
     *
     * Adjust these statuses to match your
     * InvoiceStatus enum.
     */
    const publicStatuses = [
      "SENT",
      "PAID",
      "OVERDUE",
    ]

    if (!publicStatuses.includes(invoice.status)) {
      return NextResponse.json(
        {
          error: "This invoice is not publicly available.",
        },
        {
          status: 403,
        }
      )
    }

    const pdf = await PDFDocument.create()

    const regularFont = await pdf.embedFont(
      StandardFonts.Helvetica
    )

    const boldFont = await pdf.embedFont(
      StandardFonts.HelveticaBold
    )

    const pageWidth = 595.28
    const pageHeight = 841.89
    const margin = 50

    const primaryColor = rgb(
      0.18,
      0.69,
      0.71
    )

    const darkColor = rgb(
      0.12,
      0.12,
      0.14
    )

    const mutedColor = rgb(
      0.45,
      0.45,
      0.48
    )

    const lightColor = rgb(
      0.92,
      0.92,
      0.93
    )

    const whiteColor = rgb(
      1,
      1,
      1
    )

    let page = pdf.addPage([
      pageWidth,
      pageHeight,
    ])

    let y = pageHeight - margin

    const formatCurrency = (
      value: number
    ) => {
      try {
        return new Intl.NumberFormat(
          "en-NG",
          {
            style: "currency",
            currency:
              invoice.currency || "NGN",
          }
        ).format(value)
      } catch {
        return `${invoice.currency} ${value.toFixed(2)}`
      }
    }

    const formatDate = (
      date: Date
    ) => {
      return new Intl.DateTimeFormat(
        "en-NG",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      ).format(date)
    }

    const drawText = (
      text: string,
      x: number,
      y: number,
      options?: {
        size?: number
        font?: typeof regularFont
        color?: ReturnType<typeof rgb>
      }
    ) => {
      page.drawText(text, {
        x,
        y,
        size: options?.size ?? 10,
        font:
          options?.font ?? regularFont,
        color:
          options?.color ?? darkColor,
      })
    }

    /*
     * Header
     */

    drawText(
      "INVOICE",
      margin,
      y,
      {
        size: 28,
        font: boldFont,
        color: primaryColor,
      }
    )

    drawText(
      invoice.invoiceNumber,
      margin,
      y - 25,
      {
        size: 10,
        color: mutedColor,
      }
    )

    const rightX =
      pageWidth - margin - 150

    drawText(
      "BILL TO",
      rightX,
      y,
      {
        size: 9,
        font: boldFont,
        color: primaryColor,
      }
    )

    drawText(
      invoice.customer.name,
      rightX,
      y - 20,
      {
        size: 11,
        font: boldFont,
      }
    )

    if (invoice.customer.email) {
      drawText(
        invoice.customer.email,
        rightX,
        y - 37,
        {
          size: 9,
          color: mutedColor,
        }
      )
    }

    y -= 75

    page.drawLine({
      start: {
        x: margin,
        y,
      },
      end: {
        x: pageWidth - margin,
        y,
      },
      thickness: 1,
      color: lightColor,
    })

    /*
     * Invoice dates
     */

    y -= 40

    drawText(
      "Issue date",
      margin,
      y,
      {
        size: 9,
        color: mutedColor,
      }
    )

    drawText(
      formatDate(invoice.issueDate),
      margin,
      y - 18,
      {
        size: 10,
        font: boldFont,
      }
    )

    drawText(
      "Due date",
      200,
      y,
      {
        size: 9,
        color: mutedColor,
      }
    )

    drawText(
      formatDate(invoice.dueDate),
      200,
      y - 18,
      {
        size: 10,
        font: boldFont,
      }
    )

    if (invoice.paymentTerm) {
      drawText(
        "Payment terms",
        350,
        y,
        {
          size: 9,
          color: mutedColor,
        }
      )

      drawText(
        invoice.paymentTerm,
        350,
        y - 18,
        {
          size: 10,
          font: boldFont,
        }
      )
    }

    /*
     * Line items
     */

    y -= 70

    const tableX = margin
    const tableWidth =
      pageWidth - margin * 2

    const descriptionX =
      tableX + 10

    const quantityX =
      tableX + 330

    const rateX =
      tableX + 395

    const amountX =
      tableX + 480

    page.drawRectangle({
      x: tableX,
      y: y - 25,
      width: tableWidth,
      height: 30,
      color: primaryColor,
    })

    drawText(
      "Description",
      descriptionX,
      y - 15,
      {
        size: 9,
        font: boldFont,
        color: whiteColor,
      }
    )

    drawText(
      "Qty",
      quantityX,
      y - 15,
      {
        size: 9,
        font: boldFont,
        color: whiteColor,
      }
    )

    drawText(
      "Rate",
      rateX,
      y - 15,
      {
        size: 9,
        font: boldFont,
        color: whiteColor,
      }
    )

    drawText(
      "Amount",
      amountX,
      y - 15,
      {
        size: 9,
        font: boldFont,
        color: whiteColor,
      }
    )

    y -= 45

    for (const item of invoice.lineItems) {
      if (y < 150) {
        page = pdf.addPage([
          pageWidth,
          pageHeight,
        ])

        y = pageHeight - margin
      }

      const amount =
        Number(item.rate) *
        item.quantity

      drawText(
        item.description,
        descriptionX,
        y,
        {
          size: 9,
        }
      )

      drawText(
        String(item.quantity),
        quantityX,
        y,
        {
          size: 9,
        }
      )

      drawText(
        formatCurrency(
          Number(item.rate)
        ),
        rateX,
        y,
        {
          size: 9,
        }
      )

      drawText(
        formatCurrency(amount),
        amountX,
        y,
        {
          size: 9,
        }
      )

      page.drawLine({
        start: {
          x: tableX,
          y: y - 10,
        },
        end: {
          x: tableX + tableWidth,
          y: y - 10,
        },
        thickness: 0.5,
        color: lightColor,
      })

      y -= 30
    }

    /*
     * Totals
     */

    const subtotal =
      invoice.lineItems.reduce<number>(
        (sum, item) =>
          sum +
          Number(item.rate) *
            item.quantity,
        0
      )

    const discount =
      Number(invoice.discount)

    const taxableAmount =
      Math.max(
        subtotal - discount,
        0
      )

    const tax =
      taxableAmount *
      (Number(invoice.taxRate) / 100)

    const total =
      taxableAmount + tax

    y -= 25

    const totalsX = 350

    drawText(
      "Subtotal",
      totalsX,
      y,
      {
        size: 9,
        color: mutedColor,
      }
    )

    drawText(
      formatCurrency(subtotal),
      amountX,
      y,
      {
        size: 9,
        font: boldFont,
      }
    )

    y -= 22

    if (discount > 0) {
      drawText(
        "Discount",
        totalsX,
        y,
        {
          size: 9,
          color: mutedColor,
        }
      )

      drawText(
        `- ${formatCurrency(discount)}`,
        amountX,
        y,
        {
          size: 9,
          font: boldFont,
        }
      )

      y -= 22
    }

    if (tax > 0) {
      drawText(
        `Tax (${invoice.taxRate}%)`,
        totalsX,
        y,
        {
          size: 9,
          color: mutedColor,
        }
      )

      drawText(
        formatCurrency(tax),
        amountX,
        y,
        {
          size: 9,
          font: boldFont,
        }
      )

      y -= 22
    }

    page.drawLine({
      start: {
        x: totalsX,
        y,
      },
      end: {
        x: pageWidth - margin,
        y,
      },
      thickness: 1,
      color: lightColor,
    })

    y -= 25

    drawText(
      "Total",
      totalsX,
      y,
      {
        size: 12,
        font: boldFont,
      }
    )

    drawText(
      formatCurrency(total),
      amountX,
      y,
      {
        size: 12,
        font: boldFont,
        color: primaryColor,
      }
    )

    /*
     * Notes
     */

    if (invoice.notes) {
      y -= 60

      drawText(
        "Notes",
        margin,
        y,
        {
          size: 10,
          font: boldFont,
        }
      )

      drawText(
        invoice.notes,
        margin,
        y - 18,
        {
          size: 9,
          color: mutedColor,
        }
      )
    }

    /*
     * Footer
     */

    const pages = pdf.getPages()

    pages.forEach(
      (pdfPage, index) => {
        pdfPage.drawLine({
          start: {
            x: margin,
            y: 40,
          },
          end: {
            x: pageWidth - margin,
            y: 40,
          },
          thickness: 0.5,
          color: lightColor,
        })

        pdfPage.drawText(
          `Invoice ${invoice.invoiceNumber}`,
          {
            x: margin,
            y: 25,
            size: 8,
            font: regularFont,
            color: mutedColor,
          }
        )

        pdfPage.drawText(
          `Page ${index + 1} of ${pages.length}`,
          {
            x:
              pageWidth -
              margin -
              65,
            y: 25,
            size: 8,
            font: regularFont,
            color: mutedColor,
          }
        )
      }
    )

    const pdfBytes = await pdf.save()

    const pdfBuffer =
      new ArrayBuffer(
        pdfBytes.byteLength
      )

    new Uint8Array(
      pdfBuffer
    ).set(pdfBytes)

    return new Response(
      pdfBuffer,
      {
        status: 200,
        headers: {
          "Content-Type":
            "application/pdf",

          "Content-Disposition":
            `attachment; filename="${invoice.invoiceNumber}.pdf"`,

          "Content-Length":
            String(
              pdfBytes.byteLength
            ),

          "Cache-Control":
            "no-store",
        },
      }
    )
  } catch (error) {
    console.error(
      "Failed to generate public invoice PDF:",
      error
    )

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate invoice PDF.",
      },
      {
        status: 500,
      }
    )
  }
}