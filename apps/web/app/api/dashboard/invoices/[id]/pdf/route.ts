import { PDFDocument, rgb } from "pdf-lib"
import { NextResponse } from "next/server"
import { prisma } from "@repo/db"
import fontkit from "@pdf-lib/fontkit"
import path from "path"
import { readFileSync } from "fs"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // ---------------------------------------------------------
    // 1. Get invoice
    // ---------------------------------------------------------

    const invoice = await prisma.invoice.findUnique({
      where: {
        id,
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
    // 2. Get business profile
    // ---------------------------------------------------------

    const businessProfile = await prisma.businessProfile.findUnique({
      where: {
        userId: invoice.userId,
      },
      select: {
        businessName: true,
        email: true,
        phone: true,
        website: true,
        address: true,
        city: true,
        state: true,
        postalCode: true,
        taxId: true,
        logoUrl: true,
      },
    })

    // ---------------------------------------------------------
    // 3. Calculate invoice totals
    // ---------------------------------------------------------

    const subtotal = invoice.lineItems.reduce<number>((sum, item) => {
      return sum + Number(item.rate) * item.quantity
    }, 0)

    const discountPercent = Number(invoice.discount)
    const discountAmount = subtotal * (discountPercent / 100)

    const subtotalAfterDiscount = Math.max(subtotal - discountAmount, 0)

    const taxRate = Number(invoice.taxRate)
    const tax = subtotalAfterDiscount * (taxRate / 100)

    const total = subtotalAfterDiscount + tax

    // ---------------------------------------------------------
    // 4. Create PDF
    // ---------------------------------------------------------

    const pdf = await PDFDocument.create()

    pdf.registerFontkit(fontkit)

    const fontPathRegular = path.join(
      process.cwd(),
      "public/fonts/Inter_28pt-Medium.ttf"
    )

    const fontPathBold = path.join(
      process.cwd(),
      "public/fonts/Inter_28pt-Bold.ttf"
    )

    const fontBytesRegular = readFileSync(fontPathRegular)
    const fontBytesBold = readFileSync(fontPathBold)

    const regularFont = await pdf.embedFont(fontBytesRegular)
    const boldFont = await pdf.embedFont(fontBytesBold)

    const pageWidth = 595.28
    const pageHeight = 841.89
    const margin = 50

    let page = pdf.addPage([pageWidth, pageHeight])

    // ---------------------------------------------------------
    // 5. Colors
    // ---------------------------------------------------------

    const primaryColor = rgb(0.18, 0.69, 0.71)
    const darkColor = rgb(0.12, 0.12, 0.14)
    const mutedColor = rgb(0.45, 0.45, 0.48)
    const lightColor = rgb(0.9, 0.9, 0.92)
    const cardBackground = rgb(0.97, 0.97, 0.98)
    const whiteColor = rgb(1, 1, 1)

    // ---------------------------------------------------------
    // 6. Helpers
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

    const drawRightText = (
      text: string,
      rightX: number,
      y: number,
      options?: {
        size?: number
        font?: typeof regularFont
        color?: ReturnType<typeof rgb>
      }
    ) => {
      const size = options?.size ?? 10
      const font = options?.font ?? regularFont

      const textWidth = font.widthOfTextAtSize(text, size)

      page.drawText(text, {
        x: rightX - textWidth,
        y,
        size,
        font,
        color: options?.color ?? darkColor,
      })
    }

    const drawCenteredText = (
      text: string,
      centerX: number,
      y: number,
      options?: {
        size?: number
        font?: typeof regularFont
        color?: ReturnType<typeof rgb>
      }
    ) => {
      const size = options?.size ?? 10
      const font = options?.font ?? regularFont

      const textWidth = font.widthOfTextAtSize(text, size)

      page.drawText(text, {
        x: centerX - textWidth / 2,
        y,
        size,
        font,
        color: options?.color ?? darkColor,
      })
    }

    // ---------------------------------------------------------
    // 7. Load business logo
    // ---------------------------------------------------------

    let businessLogo:
      | Awaited<ReturnType<typeof pdf.embedPng>>
      | Awaited<ReturnType<typeof pdf.embedJpg>>
      | null = null

    if (businessProfile?.logoUrl) {
      try {
        const logoResponse = await fetch(businessProfile.logoUrl)

        if (logoResponse.ok) {
          const logoBuffer = await logoResponse.arrayBuffer()
          const logoBytes = new Uint8Array(logoBuffer)

          const contentType =
            logoResponse.headers.get("content-type")?.toLowerCase() ?? ""

          if (contentType.includes("png")) {
            businessLogo = await pdf.embedPng(logoBytes)
          } else if (
            contentType.includes("jpeg") ||
            contentType.includes("jpg")
          ) {
            businessLogo = await pdf.embedJpg(logoBytes)
          }
        }
      } catch (error) {
        console.warn("Failed to load business logo:", error)

        // Logo failure should never prevent invoice generation.
        businessLogo = null
      }
    }

    // ---------------------------------------------------------
    // 8. Dynamic header positioning
    // ---------------------------------------------------------

    const hasLogo = Boolean(businessLogo)

    /*
     * With logo:
     *
     * Logo
     * INVOICE
     * INV-0001
     *
     * Without logo:
     *
     * INVOICE
     * INV-0001
     *
     * This prevents an empty logo area from being reserved.
     */

    const invoiceTitleY = hasLogo ? pageHeight - 125 : pageHeight - 70

    const invoiceNumberY = invoiceTitleY - 25

    const dividerY = hasLogo ? pageHeight - 160 : pageHeight - 130

    const infoY = hasLogo ? pageHeight - 200 : pageHeight - 170

    // ---------------------------------------------------------
    // 9. Business logo
    // ---------------------------------------------------------

    if (businessLogo) {
      const maxLogoWidth = 95
      const maxLogoHeight = 55

      const logoWidth = businessLogo.width
      const logoHeight = businessLogo.height

      const scale = Math.min(
        maxLogoWidth / logoWidth,
        maxLogoHeight / logoHeight,
        1
      )

      const displayWidth = logoWidth * scale
      const displayHeight = logoHeight * scale

      page.drawImage(businessLogo, {
        x: margin,
        y: pageHeight - 70 - displayHeight,
        width: displayWidth,
        height: displayHeight,
      })
    }

    // ---------------------------------------------------------
    // 10. Invoice title
    // ---------------------------------------------------------

    drawText("INVOICE", margin, invoiceTitleY, {
      size: 28,
      font: boldFont,
      color: primaryColor,
    })

    drawText(invoice.invoiceNumber, margin, invoiceNumberY, {
      size: 10,
      color: mutedColor,
    })

    // ---------------------------------------------------------
    // 11. Customer information
    // ---------------------------------------------------------

    const customerWidth = 200
    const customerX = pageWidth - margin
    // const customerX = pageWidth - margin - customerWidth

    drawRightText(
      "BILL TO",
      customerX,
      hasLogo ? pageHeight - 60 : pageHeight - 60,
      {
        size: 9,
        font: boldFont,
        color: primaryColor,
      }
    )

    drawRightText(invoice.customer.name, customerX, pageHeight - 80, {
      size: 12,
      font: boldFont,
    })

    let customerY = pageHeight - 97

    if (invoice.customer.email) {
      drawRightText(invoice.customer.email, customerX, customerY, {
        size: 9,
        color: mutedColor,
      })

      customerY -= 14
    }

    // ---------------------------------------------------------
    // 12. Customer phone/address
    // ---------------------------------------------------------

    if ("phone" in invoice.customer && invoice.customer.phone) {
      drawText(invoice.customer.phone, customerX, customerY, {
        size: 9,
        color: mutedColor,
      })

      customerY -= 14
    }

    if ("address" in invoice.customer && invoice.customer.address) {
      drawText(invoice.customer.address, customerX, customerY, {
        size: 9,
        color: mutedColor,
      })
    }

    // ---------------------------------------------------------
    // 13. Divider
    // ---------------------------------------------------------

    page.drawLine({
      start: {
        x: margin,
        y: dividerY,
      },
      end: {
        x: pageWidth - margin,
        y: dividerY,
      },
      thickness: 1,
      color: lightColor,
    })

    // ---------------------------------------------------------
    // 14. Invoice information cards
    // ---------------------------------------------------------

    const infoCardY = infoY - 42
    const infoCardHeight = 58
    const infoGap = 12

    const totalInfoWidth = pageWidth - margin * 2
    const infoCardWidth = (totalInfoWidth - infoGap * 2) / 3

    const drawInfoCard = (x: number, label: string, value: string) => {
      page.drawRectangle({
        x,
        y: infoCardY,
        width: infoCardWidth,
        height: infoCardHeight,
        color: cardBackground,
        borderColor: lightColor,
        borderWidth: 0.8,
      })

      drawText(label.toUpperCase(), x + 12, infoCardY + 38, {
        size: 7.5,
        font: boldFont,
        color: mutedColor,
      })

      drawText(value, x + 12, infoCardY + 18, {
        size: 10,
        font: boldFont,
        color: darkColor,
      })
    }

    drawInfoCard(margin, "Issue Date", formatDate(invoice.issueDate))

    drawInfoCard(
      margin + infoCardWidth + infoGap,
      "Due Date",
      formatDate(invoice.dueDate)
    )

    drawInfoCard(
      margin + (infoCardWidth + infoGap) * 2,
      "Payment Terms",
      invoice.paymentTerm ?? "Due on receipt"
    )

    // ---------------------------------------------------------
    // 15. Line items table
    // ---------------------------------------------------------

    let y = infoCardY - 35

    const tableX = margin
    const tableWidth = pageWidth - margin * 2
    const descriptionX = tableX + 10

    const quantityRightX = 380
    const rateRightX = 455
    const amountRightX = pageWidth - margin - 10

    page.drawRectangle({
      x: tableX,
      y: y - 25,
      width: tableWidth,
      height: 30,
      color: primaryColor,
    })

    drawText("Item/Description", descriptionX, y - 15, {
      size: 9,
      font: boldFont,
      color: whiteColor,
    })

    drawRightText("Qty", quantityRightX, y - 15, {
      size: 9,
      font: boldFont,
      color: whiteColor,
    })

    drawRightText("Rate", rateRightX, y - 15, {
      size: 9,
      font: boldFont,
      color: whiteColor,
    })

    drawRightText("Amount", amountRightX, y - 15, {
      size: 9,
      font: boldFont,
      color: whiteColor,
    })

    y -= 45

    // ---------------------------------------------------------
    // 16. Line items
    // ---------------------------------------------------------

    for (const item of invoice.lineItems) {
      if (y < 120) {
        page = pdf.addPage([pageWidth, pageHeight])
        y = pageHeight - margin
      }

      const quantity = item.quantity
      const rate = Number(item.rate)
      const amount = quantity * rate

      drawText(item.name, descriptionX, y, {
        size: 9,
      })

      drawText(item.description, descriptionX, y - 14, {
        size: 9,
        color: mutedColor,
      })

      drawRightText(String(quantity), quantityRightX, y, {
        size: 9,
      })

      drawRightText(formatCurrency(rate), rateRightX, y, {
        size: 9,
      })

      drawRightText(formatCurrency(amount), amountRightX, y, {
        size: 9,
      })

      page.drawLine({
        start: {
          x: tableX,
          y: y - 24,
        },
        end: {
          x: tableX + tableWidth,
          y: y - 24,
        },
        thickness: 0.5,
        color: lightColor,
      })

      y -= 30
    }

    // ---------------------------------------------------------
    // 17. Totals
    // ---------------------------------------------------------

    y -= 20

    const totalsX = 350

    drawText("Subtotal", totalsX, y, {
      size: 9,
      color: mutedColor,
    })

    drawRightText(formatCurrency(subtotal), amountRightX, y, {
      size: 9,
      font: boldFont,
    })

    y -= 22

    drawText("Discount", totalsX, y, {
      size: 9,
      color: mutedColor,
    })

    drawRightText(`- ${formatCurrency(discountAmount)}`, amountRightX, y, {
      size: 9,
      font: boldFont,
    })

    y -= 22

    drawText(`Tax (${taxRate}%)`, totalsX, y, {
      size: 9,
      color: mutedColor,
    })

    drawRightText(formatCurrency(tax), amountRightX, y, {
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

    drawRightText(formatCurrency(total), amountRightX, y, {
      size: 12,
      font: boldFont,
      color: primaryColor,
    })

    // ---------------------------------------------------------
    // 18. Notes
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
    // 19. Footer
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

      const pageText = `Page ${index + 1} of ${pages.length}`

      const pageTextWidth = regularFont.widthOfTextAtSize(pageText, 8)

      pdfPage.drawText(pageText, {
        x: pageWidth - margin - pageTextWidth,
        y: 25,
        size: 8,
        font: regularFont,
        color: mutedColor,
      })
    })

    // ---------------------------------------------------------
    // 20. Save PDF
    // ---------------------------------------------------------

    const pdfBytes = await pdf.save()

    const pdfBuffer = new ArrayBuffer(pdfBytes.byteLength)

    new Uint8Array(pdfBuffer).set(pdfBytes)

    // ---------------------------------------------------------
    // 21. Return PDF
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
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      }
    )
  }
}
