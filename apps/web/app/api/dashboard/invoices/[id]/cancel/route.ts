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

export async function POST(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    // ---------------------------------------------
    // 1. Authenticate user
    // ---------------------------------------------

    const token = req.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const jwtSecret = process.env.JWT_SECRET

    if (!jwtSecret) {
      throw new Error(
        "JWT_SECRET environment variable is missing"
      )
    }

    let decoded: AuthPayload

    try {
      decoded = jwt.verify(
        token,
        jwtSecret
      ) as AuthPayload
    } catch {
      return NextResponse.json(
        {
          error:
            "Invalid or expired authentication token",
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
    // 3. Find invoice belonging to user
    // ---------------------------------------------

    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        userId: decoded.userId,
      },
    })

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      )
    }

    // ---------------------------------------------
    // 4. Validate current status
    // ---------------------------------------------

    if (invoice.status === "CANCELLED") {
      return NextResponse.json(
        {
          error: "Invoice is already cancelled",
        },
        { status: 409 }
      )
    }

    if (invoice.status === "PAID") {
      return NextResponse.json(
        {
          error:
            "A paid invoice cannot be cancelled",
        },
        { status: 400 }
      )
    }

    // ---------------------------------------------
    // 5. Cancel invoice
    // ---------------------------------------------

    const updatedInvoice =
      await prisma.invoice.update({
        where: {
          id: invoice.id,
        },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
        },
        include: {
          customer: true,
          lineItems: true,
        },
      })

    // ---------------------------------------------
    // 6. Return updated invoice
    // ---------------------------------------------

    return NextResponse.json({
      message: "Invoice cancelled successfully",
      invoice: updatedInvoice,
    })
  } catch (error) {
    console.error(
      "Cancel Invoice Error:",
      error
    )

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to cancel invoice",
      },
      { status: 500 }
    )
  }
}