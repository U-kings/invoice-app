import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import { NextResponse } from "next/server"
import { prisma } from "@repo/db"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // ---------------------------------------------------------
    // 1. Get invoice
    // ---------------------------------------------------------

    const invoice = await prisma.invoice.findUnique({
      where: {
        id: id,
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

    // ---------------------------------------------------------
    // 2. Calculate invoice totals
    // ---------------------------------------------------------

    const subtotal = invoice.lineItems.reduce<number>((sum, item) => {
      return sum + Number(item.rate) * item.quantity
    }, 0)

    const discount = Number(invoice.discount)

    const subtotalAfterDiscount = Math.max(subtotal - discount, 0)

    const taxRate = Number(invoice.taxRate)

    const tax = subtotalAfterDiscount * (taxRate / 100)

    const total = subtotalAfterDiscount + tax

    // ---------------------------------------------------------
    // 3. Create PDF
    // ---------------------------------------------------------

    const pdf = await PDFDocument.create()

    const regularFont = await pdf.embedFont(StandardFonts.Helvetica)

    const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold)

    const pageWidth = 595.28
    const pageHeight = 841.89
    const margin = 50

    let page = pdf.addPage([pageWidth, pageHeight])

    // ---------------------------------------------------------
    // 4. Colors
    // ---------------------------------------------------------

    const primaryColor = rgb(0.18, 0.69, 0.71)

    const darkColor = rgb(0.12, 0.12, 0.14)

    const mutedColor = rgb(0.45, 0.45, 0.48)

    const lightColor = rgb(0.92, 0.92, 0.93)

    const whiteColor = rgb(1, 1, 1)

    // ---------------------------------------------------------
    // 5. Helpers
    // ---------------------------------------------------------

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: invoice.currency || "NGN",
      }).format(value)
    }

    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat("en-NG", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date)
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
        font: options?.font ?? regularFont,
        color: options?.color ?? darkColor,
      })
    }

    // ---------------------------------------------------------
    // 6. Header
    // ---------------------------------------------------------

    drawText("INVOICE", margin, pageHeight - 70, {
      size: 28,
      font: boldFont,
      color: primaryColor,
    })

    drawText(invoice.invoiceNumber, margin, pageHeight - 95, {
      size: 10,
      color: mutedColor,
    })

    // ---------------------------------------------------------
    // 7. Customer information
    // ---------------------------------------------------------

    const customerX = pageWidth - margin - 200

    drawText("BILL TO", customerX, pageHeight - 70, {
      size: 9,
      font: boldFont,
      color: primaryColor,
    })

    drawText(invoice.customer.name, customerX, pageHeight - 90, {
      size: 12,
      font: boldFont,
    })

    if (invoice.customer.email) {
      drawText(invoice.customer.email, customerX, pageHeight - 107, {
        size: 9,
        color: mutedColor,
      })
    }

    // ---------------------------------------------------------
    // 8. Divider
    // ---------------------------------------------------------

    page.drawLine({
      start: {
        x: margin,
        y: pageHeight - 130,
      },
      end: {
        x: pageWidth - margin,
        y: pageHeight - 130,
      },
      thickness: 1,
      color: lightColor,
    })

    // ---------------------------------------------------------
    // 9. Invoice information
    // ---------------------------------------------------------

    let y = pageHeight - 170

    drawText("Issue Date", margin, y, {
      size: 9,
      color: mutedColor,
    })

    drawText(formatDate(invoice.issueDate), margin, y - 18, {
      size: 10,
      font: boldFont,
    })

    drawText("Due Date", 190, y, {
      size: 9,
      color: mutedColor,
    })

    drawText(formatDate(invoice.dueDate), 190, y - 18, {
      size: 10,
      font: boldFont,
    })

    drawText("Payment Terms", 350, y, {
      size: 9,
      color: mutedColor,
    })

    drawText(invoice.paymentTerm ?? "Due on receipt", 350, y - 18, {
      size: 10,
      font: boldFont,
    })

    // ---------------------------------------------------------
    // 10. Line items table
    // ---------------------------------------------------------

    y -= 80

    const tableX = margin
    const tableWidth = pageWidth - margin * 2

    const descriptionX = tableX + 10

    const quantityX = tableX + 330

    const rateX = tableX + 395

    const amountX = tableX + 480

    page.drawRectangle({
      x: tableX,
      y: y - 25,
      width: tableWidth,
      height: 30,
      color: primaryColor,
    })

    drawText("Description", descriptionX, y - 15, {
      size: 9,
      font: boldFont,
      color: whiteColor,
    })

    drawText("Qty", quantityX, y - 15, {
      size: 9,
      font: boldFont,
      color: whiteColor,
    })

    drawText("Rate", rateX, y - 15, {
      size: 9,
      font: boldFont,
      color: whiteColor,
    })

    drawText("Amount", amountX, y - 15, {
      size: 9,
      font: boldFont,
      color: whiteColor,
    })

    y -= 45

    // ---------------------------------------------------------
    // 11. Line items
    // ---------------------------------------------------------

    for (const item of invoice.lineItems) {
      if (y < 120) {
        page = pdf.addPage([pageWidth, pageHeight])

        y = pageHeight - margin
      }

      const quantity = item.quantity

      const rate = Number(item.rate)

      const amount = quantity * rate

      drawText(item.description, descriptionX, y, {
        size: 9,
      })

      drawText(String(quantity), quantityX, y, {
        size: 9,
      })

      drawText(formatCurrency(rate), rateX, y, {
        size: 9,
      })

      drawText(formatCurrency(amount), amountX, y, {
        size: 9,
      })

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

    // ---------------------------------------------------------
    // 12. Totals
    // ---------------------------------------------------------

    y -= 20

    const totalsX = 350

    drawText("Subtotal", totalsX, y, {
      size: 9,
      color: mutedColor,
    })

    drawText(formatCurrency(subtotal), amountX, y, {
      size: 9,
      font: boldFont,
    })

    y -= 22

    drawText("Discount", totalsX, y, {
      size: 9,
      color: mutedColor,
    })

    drawText(`- ${formatCurrency(discount)}`, amountX, y, {
      size: 9,
      font: boldFont,
    })

    y -= 22

    drawText(`Tax (${taxRate}%)`, totalsX, y, {
      size: 9,
      color: mutedColor,
    })

    drawText(formatCurrency(tax), amountX, y, {
      size: 9,
      font: boldFont,
    })

    y -= 15

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

    drawText("Total", totalsX, y, {
      size: 12,
      font: boldFont,
    })

    drawText(formatCurrency(total), amountX, y, {
      size: 12,
      font: boldFont,
      color: primaryColor,
    })

    // ---------------------------------------------------------
    // 13. Notes
    // ---------------------------------------------------------

    if (invoice.notes) {
      y -= 60

      drawText("Notes", margin, y, {
        size: 10,
        font: boldFont,
      })

      y -= 18

      drawText(invoice.notes, margin, y, {
        size: 9,
        color: mutedColor,
      })
    }

    // ---------------------------------------------------------
    // 14. Footer
    // ---------------------------------------------------------

    const pages = pdf.getPages()

    pages.forEach((pdfPage, index) => {
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

      pdfPage.drawText(`Invoice ${invoice.invoiceNumber}`, {
        x: margin,
        y: 25,
        size: 8,
        font: regularFont,
        color: mutedColor,
      })

      pdfPage.drawText(`Page ${index + 1} of ${pages.length}`, {
        x: pageWidth - margin - 65,
        y: 25,
        size: 8,
        font: regularFont,
        color: mutedColor,
      })
    })

    // ---------------------------------------------------------
    // 15. Save PDF
    // ---------------------------------------------------------

    const pdfBytes = await pdf.save()

    // Fix TypeScript's
    // Uint8Array<ArrayBufferLike> issue
    const pdfBuffer = new ArrayBuffer(pdfBytes.byteLength)

    new Uint8Array(pdfBuffer).set(pdfBytes)

    // ---------------------------------------------------------
    // 16. Return PDF
    // ---------------------------------------------------------

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",

        "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`,

        "Content-Length": String(pdfBytes.byteLength),

        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
   console.error("Failed to generate invoice PDF:", error)

  return NextResponse.json(
    {
      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    },
    { status: 500 }
  )
  }
}
