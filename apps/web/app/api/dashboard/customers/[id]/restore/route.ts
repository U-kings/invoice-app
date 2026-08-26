import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { prisma } from "@repo/db"

interface RouteContext {
  params: Promise<{ id: string }>
}

interface AuthPayload {
  userId: string
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
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
        { error: "Invalid or expired authentication token" },
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
    // 2. Get customer ID
    // ---------------------------------------------
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 }
      )
    }

    // ---------------------------------------------
    // 3. Verify ownership and current status
    // ---------------------------------------------
    const customer = await prisma.customer.findFirst({
      where: {
        id,
        userId: decoded.userId,
      },
      select: {
        id: true,
        status: true,
      },
    })

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    // Business Logic: Prevent running a restore if they are already active
    if (customer.status === "ACTIVE") {
      return NextResponse.json(
        { error: "Customer is already active" },
        { status: 400 }
      )
    }

    // ---------------------------------------------
    // 4. Restore customer status
    // ---------------------------------------------
    const updatedCustomer = await prisma.customer.update({
      where: {
        id: customer.id,
      },
      data: {
        status: "ACTIVE",
      },
    })

    return NextResponse.json({
      message: "Customer restored successfully",
      customer: {
        id: updatedCustomer.id,
        status: updatedCustomer.status,
      },
    })
  } catch (error) {
    console.error("Restore Customer Error:", error)

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to restore customer",
      },
      { status: 500 }
    )
  }
}
