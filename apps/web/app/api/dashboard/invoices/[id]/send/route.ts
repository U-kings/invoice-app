import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { sendInvoice } from "@/lib/invoice/send-invoice"

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
    // 1. Authenticate
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
    // 3. Send invoice
    // ---------------------------------------------

    const invoice = await sendInvoice(
      id,
      decoded.userId
    )

    // ---------------------------------------------
    // 4. Return updated invoice
    // ---------------------------------------------

    return NextResponse.json(
      {
        message: "Invoice sent successfully",
        invoice,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error(
      "Send Invoice Error:",
      error
    )

    const message =
      error instanceof Error
        ? error.message
        : "Failed to send invoice"

    return NextResponse.json(
      { error: message },
      { status: 400 }
    )
  }
}