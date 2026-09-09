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
    // 1. Get Data (Include User for fallback)
    // ---------------------------------------------------------
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { customer: true, lineItems: true },
    })

    if (!invoice)
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 })

    const [businessProfile, paymentSettings, user] = await Promise.all([
      prisma.businessProfile.findUnique({ where: { userId: invoice.userId } }),
      prisma.paymentSettings.findUnique({ where: { userId: invoice.userId } }),
      prisma.user.findUnique({ where: { id: invoice.userId } }),
    ])

    // ---------------------------------------------------------
    // 2. Calculations
    // ---------------------------------------------------------
    const subtotal = invoice.lineItems.reduce<number>(
      (sum, item) => sum + Number(item.rate) * item.quantity,
      0
    )
    const discountAmount = subtotal * (Number(invoice.discount || 0) / 100)
    const subtotalAfterDiscount = Math.max(subtotal - discountAmount, 0)
    const tax = subtotalAfterDiscount * (Number(invoice.taxRate || 0) / 100)
    const total = subtotalAfterDiscount + tax

    // ---------------------------------------------------------
    // 3. Setup PDF
    // ---------------------------------------------------------
    const pdf = await PDFDocument.create()
    pdf.registerFontkit(fontkit)

    const fontBytesRegular = readFileSync(
      path.join(process.cwd(), "public/fonts/Inter_28pt-Medium.ttf")
    )
    const fontBytesBold = readFileSync(
      path.join(process.cwd(), "public/fonts/Inter_28pt-Bold.ttf")
    )
    const regularFont = await pdf.embedFont(fontBytesRegular)
    const boldFont = await pdf.embedFont(fontBytesBold)

    const pageWidth = 595.28
    const pageHeight = 841.89
    const margin = 50
    let page = pdf.addPage([pageWidth, pageHeight])

    // Professional neutral palette
    const primaryColor = rgb(0.18, 0.21, 0.25) // Charcoal
    const darkColor = rgb(0.2, 0.2, 0.2) // Off-Black
    const mutedColor = rgb(0.44, 0.5, 0.58) // Slate Gray
    const lightColor = rgb(0.96, 0.96, 0.98) // Light Gray
    const whiteColor = rgb(1, 1, 1) // Pure White

    // Helpers
    const formatCurrency = (v: number) =>
      new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: invoice.currency || "NGN",
      }).format(v)
    const formatDate = (d: Date) =>
      new Intl.DateTimeFormat("en-NG", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(d)
    const drawText = (text: string, x: number, y: number, opt?: any) =>
      page.drawText(text, {
        x,
        y,
        size: opt?.size ?? 10,
        font: opt?.font ?? regularFont,
        color: opt?.color ?? darkColor,
      })
    const drawRightText = (
      text: string,
      rightX: number,
      y: number,
      opt?: any
    ) => {
      const size = opt?.size ?? 10
      const font = opt?.font ?? regularFont
      page.drawText(text, {
        x: rightX - font.widthOfTextAtSize(text, size),
        y,
        size,
        font,
        color: opt?.color ?? darkColor,
      })
    }

    // ---------------------------------------------------------
    // 4. Dynamic Header (Logo & Right-Aligned Meta)
    // ---------------------------------------------------------
    let currentY = pageHeight - margin

    const metaX = pageWidth - margin
    drawRightText(`Invoice No: ${invoice.invoiceNumber}`, metaX, currentY, {
      font: boldFont,
    })
    drawRightText(
      `Date: ${formatDate(invoice.issueDate)}`,
      metaX,
      currentY - 15,
      { size: 9, color: mutedColor }
    )
    drawRightText(
      `Due Date: ${formatDate(invoice.dueDate)}`,
      metaX,
      currentY - 30,
      { size: 9, color: mutedColor }
    )
    if (invoice.paymentTerm) {
      drawRightText(`Terms: ${invoice.paymentTerm}`, metaX, currentY - 45, {
        size: 9,
        color: mutedColor,
      })
    }

    // Logo (Top Left)
    if (businessProfile?.logoUrl) {
      try {
        const logoResponse = await fetch(businessProfile.logoUrl)
        if (logoResponse.ok) {
          const logoBytes = new Uint8Array(await logoResponse.arrayBuffer())
          const img = (logoResponse.headers.get("content-type") || "").includes(
            "png"
          )
            ? await pdf.embedPng(logoBytes)
            : await pdf.embedJpg(logoBytes)
          const scale = Math.min(100 / img.width, 60 / img.height, 1)
          page.drawImage(img, {
            x: margin,
            y: currentY - img.height * scale,
            width: img.width * scale,
            height: img.height * scale,
          })
          currentY -= img.height * scale + 20
        }
      } catch (e) {
        console.warn("Logo load failed", e)
      }
    }

    // Invoice Title
    drawText("INVOICE", margin, currentY - 10, {
      size: 28,
      font: boldFont,
      color: primaryColor,
    })
    currentY -= 60

    // ---------------------------------------------------------
    // 5. Dynamic FROM & TO Section
    // ---------------------------------------------------------
    const fromName =
      businessProfile?.businessName || user?.firstName || "Sender"
    const fromEmail = businessProfile?.email || user?.email || ""
    const fromPhone = businessProfile?.phone || user?.phoneNumber || ""
    const fromAddress = businessProfile?.address || ""

    const colFromX = pageWidth - margin
    const billToExists = !!invoice.customer.name
    const fromExists = !!fromName

    currentY -= 5

    if (billToExists || fromExists) {
      drawText("BILL TO", margin, currentY, {
        size: 8,
        font: boldFont,
        color: primaryColor,
      })
      drawRightText("FROM", colFromX, currentY, {
        size: 8,
        font: boldFont,
        color: primaryColor,
      })

      currentY -= 18
      // Client (TO)
      drawText(invoice.customer.name, margin, currentY, {
        font: boldFont,
        size: 10,
      })
      let toOffset = 14
      if (invoice.customer.email) {
        drawText(invoice.customer.email, margin, currentY - toOffset, {
          size: 9,
          color: mutedColor,
        })
        toOffset += 12
      }
      if (invoice.customer.phone) {
        drawText(invoice.customer.phone, margin, currentY - toOffset, {
          size: 9,
          color: mutedColor,
        })
        toOffset += 12
      }
      if (invoice.customer.address) {
        drawText(invoice.customer.address, margin, currentY - toOffset, {
          size: 9,
          color: mutedColor,
        })
        toOffset += 12
      }

      // Business (FROM)
      drawRightText(fromName, colFromX, currentY, { font: boldFont, size: 10 })
      let fromOffset = 14
      if (fromEmail) {
        drawRightText(fromEmail, colFromX, currentY - fromOffset, {
          size: 9,
          color: mutedColor,
        })
        fromOffset += 12
      }
      if (fromPhone) {
        drawRightText(fromPhone, colFromX, currentY - fromOffset, {
          size: 9,
          color: mutedColor,
        })
        fromOffset += 12
      }
      if (fromAddress) {
        drawRightText(fromAddress, colFromX, currentY - fromOffset, {
          size: 9,
          color: mutedColor,
        })
        fromOffset += 12
      }

      currentY -= Math.max(toOffset, fromOffset) + 20
    }

    // ---------------------------------------------------------
    // 6. Items Table (WITH QUANTITY AND RATE)
    // ---------------------------------------------------------
    const colDescX = margin + 10
    const colQtyRightX = 350
    const colRateRightX = 435
    const colAmountRightX = pageWidth - margin - 10

    page.drawRectangle({
      x: margin,
      y: currentY - 25,
      width: pageWidth - margin * 2,
      height: 25,
      color: primaryColor,
    })
    drawText("Description", colDescX, currentY - 15, {
      color: whiteColor,
      font: boldFont,
      size: 9,
    })
    drawRightText("Qty", colQtyRightX, currentY - 15, {
      color: whiteColor,
      font: boldFont,
      size: 9,
    })
    drawRightText("Rate", colRateRightX, currentY - 15, {
      color: whiteColor,
      font: boldFont,
      size: 9,
    })
    drawRightText("Amount", colAmountRightX, currentY - 15, {
      color: whiteColor,
      font: boldFont,
      size: 9,
    })

    currentY -= 40
    for (const item of invoice.lineItems) {
      drawText(item.name, colDescX, currentY, { size: 9 })
      drawRightText(String(item.quantity), colQtyRightX, currentY, {
        size: 9,
      })
      drawRightText(formatCurrency(Number(item.rate)), colRateRightX, currentY, {
        size: 9,
      })
      drawRightText(
        formatCurrency(item.quantity * Number(item.rate)),
        colAmountRightX,
        currentY,
        { size: 9, font: boldFont }
      )
      page.drawLine({
        start: { x: margin, y: currentY - 8 },
        end: { x: pageWidth - margin, y: currentY - 8 },
        thickness: 0.5,
        color: lightColor,
      })
      currentY -= 22
    }

    // ---------------------------------------------------------
    // 7. Totals
    // ---------------------------------------------------------
    currentY -= 15
    const tX = 370
    const rX = pageWidth - margin - 10
    drawText("Subtotal", tX, currentY, { size: 9, color: mutedColor })
    drawRightText(formatCurrency(subtotal), rX, currentY, {
      size: 9,
      font: boldFont,
    })

    if (invoice.discount && Number(invoice.discount) > 0) {
      currentY -= 18
      drawText(`Discount (${invoice.discount}%)`, tX, currentY, {
        size: 9,
        color: mutedColor,
      })
      drawRightText(`-${formatCurrency(discountAmount)}`, rX, currentY, {
        size: 9,
        font: boldFont,
      })
    }

    currentY -= 18
    drawText(`Tax (${invoice.taxRate}%)`, tX, currentY, {
      size: 9,
      color: mutedColor,
    })
    drawRightText(formatCurrency(tax), rX, currentY, {
      size: 9,
      font: boldFont,
    })

    currentY -= 10
    page.drawLine({
      start: { x: tX, y: currentY },
      end: { x: rX, y: currentY },
      thickness: 1,
      color: lightColor,
    })

    currentY -= 22
    drawText("Total", tX, currentY, { size: 12, font: boldFont })
    drawRightText(formatCurrency(total), rX, currentY, {
      size: 12,
      font: boldFont,
      color: primaryColor,
    })

    // ---------------------------------------------------------
    // 8. Payment & Notes (Conditional Spacing)
    // ---------------------------------------------------------
    currentY -= 50
    if (paymentSettings) {
      let paymentSectionDrawn = false
      if (paymentSettings.bankTransfer && paymentSettings.accountNumber) {
        drawText("BANK TRANSFER", margin, currentY, {
          font: boldFont,
          size: 9,
          color: primaryColor,
        })
        drawText(
          `${paymentSettings.bankName} - ${paymentSettings.accountNumber} (${paymentSettings.accountName})`,
          margin,
          currentY - 14,
          { size: 9, color: mutedColor }
        )
        currentY -= 40
        paymentSectionDrawn = true
      }

      let providers = [
        paymentSettings.paystackEnabled && "Paystack",
        paymentSettings.stripeEnabled && "Stripe",
        paymentSettings.paypalEnabled && "PayPal",
      ].filter(Boolean)
      if (providers.length > 0) {
        drawText("ONLINE PAYMENTS", margin, currentY, {
          font: boldFont,
          size: 9,
          color: primaryColor,
        })
        drawText(providers.join(", "), margin, currentY - 14, {
          size: 9,
          color: mutedColor,
        })
        currentY -= 40
        paymentSectionDrawn = true
      }
    }

    if (invoice.notes) {
      drawText("NOTES", margin, currentY, {
        size: 9,
        font: boldFont,
        color: primaryColor,
      })
      drawText(invoice.notes, margin, currentY - 14, {
        size: 9,
        color: mutedColor,
      })
    }

    // ---------------------------------------------------------
    // 9. Save & Return
    // ---------------------------------------------------------
    const pdfBytes = await pdf.save()
    return new Response(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`,
        "Content-Length": String(pdfBytes.byteLength),
      },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "PDF Generation Failed" },
      { status: 500 }
    )
  }
}