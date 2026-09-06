import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { prisma } from "@repo/db"
import { getAuthenticatedSession } from "@/lib/auth/session"

interface RouteContext {
  params: Promise<{ id: string }>
}

interface AuthPayload {
  userId: string
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    // ---------------------------------------------
    // 1. Authenticate user
    // ---------------------------------------------
    const auth = await getAuthenticatedSession(request)

    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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
        userId: auth.userId,
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
