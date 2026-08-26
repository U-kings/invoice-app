import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

import { prisma } from "@repo/db"

interface AuthPayload {
  userId: string
}

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    // ---------------------------------------------
    // 1. Authenticate user
    // ---------------------------------------------

    const token = req.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const jwtSecret = process.env.JWT_SECRET

    if (!jwtSecret) {
      throw new Error("JWT_SECRET environment variable is missing")
    }

    let decoded: AuthPayload

    try {
      decoded = jwt.verify(token, jwtSecret) as AuthPayload
    } catch {
      return NextResponse.json(
        {
          error: "Invalid or expired authentication token",
        },
        { status: 401 }
      )
    }

    if (!decoded.userId) {
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      )
    }

    // ---------------------------------------------
    // 2. Get invoice ID
    // ---------------------------------------------

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: "Invoice ID is required" },
        { status: 400 }
      )
    }

    // ---------------------------------------------
    // 3. Find invoice and verify ownership
    // ---------------------------------------------

    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        userId: decoded.userId,
      },
      select: {
        id: true,
        invoiceNumber: true,
        status: true,
        dueDate: true,
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    // ---------------------------------------------
    // 4. Only drafts can be deleted
    // ---------------------------------------------

    const today = new Date()
    const dueDate = new Date(invoice.dueDate)

    today.setHours(0, 0, 0, 0)
    dueDate.setHours(0, 0, 0, 0)

    if (invoice.status !== "DRAFT" || dueDate < today) {
      return NextResponse.json(
        {
          error:
            "Only draft invoices can be deleted. Sent, paid, overdue, and cancelled invoices cannot be deleted.",
        },
        { status: 409 }
      )
    }

    // ---------------------------------------------
    // 5. Delete invoice
    // ---------------------------------------------

    await prisma.invoice.delete({
      where: {
        id: invoice.id,
      },
    })

    // ---------------------------------------------
    // 6. Return success
    // ---------------------------------------------

    return NextResponse.json({
      message: "Invoice deleted successfully",
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
    })
  } catch (error) {
    console.error("Delete Invoice Error:", error)

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete invoice",
      },
      { status: 500 }
    )
  }
}
