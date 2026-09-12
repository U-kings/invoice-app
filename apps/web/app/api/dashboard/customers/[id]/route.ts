import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@repo/db"
import { getAuthenticatedSession } from "@/lib/auth/session"

interface UpdateCustomerBody {
  name?: string
  email?: string
  phone?: string
  address?: string
}

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    // ---------------------------------------------
    // 1. Authenticate
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
    // 3. Parse body
    // ---------------------------------------------

    const body = (await request.json()) as UpdateCustomerBody

    const name = body.name?.trim()
    const email = body.email?.trim().toLowerCase()
    const phone = body.phone?.trim()
    const address = body.address?.trim()

    if (!name && !email && !phone && !address) {
      return NextResponse.json(
        {
          error: "At least one customer field is required",
        },
        { status: 400 }
      )
    }

    // ---------------------------------------------
    // 4. Verify ownership
    // ---------------------------------------------

    const customer = await prisma.customer.findFirst({
      where: {
        id,
        userId: auth.userId,
      },
    })

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    // ---------------------------------------------
    // 5. Validate email
    // ---------------------------------------------

    if (email) {
      const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

      if (!emailIsValid) {
        return NextResponse.json(
          {
            error: "Please provide a valid email address",
          },
          { status: 400 }
        )
      }

      const duplicate = await prisma.customer.findFirst({
        where: {
          userId: auth.userId,
          email,
          NOT: {
            id,
          },
        },
      })

      if (duplicate) {
        return NextResponse.json(
          {
            error: "A customer with this email already exists",
          },
          { status: 409 }
        )
      }
    }

    // ---------------------------------------------
    // 6. Update customer
    // ---------------------------------------------

    const updatedCustomer = await prisma.customer.update({
      where: {
        id,
      },
      data: {
        ...(name ? { name } : {}),
        ...(email ? { email } : {}),
        ...(phone ? { phone } : {}),
        ...(address ? { address } : {}),
      },
    })

    return NextResponse.json({
      message: "Customer updated successfully",
      customer: updatedCustomer,
    })
  } catch (error) {
    console.error("Update Customer Error:", error)

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update customer",
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    // ---------------------------------------------
    // 1. Authenticate (Keep your existing token verification here)
    // ---------------------------------------------
    const auth = await getAuthenticatedSession(request)

    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }
    // ---------------------------------------------
    // 2. Get customer ID
    // ---------------------------------------------
    const { id } = await params
    if (!id)
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 }
      )

    // ---------------------------------------------
    // 3. Verify ownership
    // ---------------------------------------------
    const customer = await prisma.customer.findFirst({
      where: {
        id,
        userId: auth.userId,
      },
      include: {
        invoices: {
          where: {
            // Only fetch unpaid invoices to optimize performance
            NOT: [{ status: "PAID" }, { status: "CANCELLED" }],
          },
          select: { id: true },
          take: 1,
        },
      },
    })

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    // ---------------------------------------------
    // 4. Prevent archiving if unpaid invoices exist
    // ---------------------------------------------
    // Since we filtered for non-PAID/CANCELLED invoices above,
    // any invoice in the array means they still owe money.
    if (customer.invoices.length > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot archive customer with active or unpaid invoices. Please settle or cancel them first.",
        },
        { status: 400 }
      )
    }

    // NOTE: Removed the block that stops deletion if ANY invoice exists,
    // because archiving preserves historical invoice data safely!

    // -------------------------s--------------------
    // 5. Soft-delete (Archive) customer
    // ---------------------------------------------
    await prisma.customer.update({
      where: {
        id: customer.id,
      },
      data: {
        status: "ARCHIVED", // <-- Changes status instead of deleting row
      },
    })

    return NextResponse.json({
      message: "Customer archived successfully",
    })
  } catch (error) {
    console.error("Delete Customer Error:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to archive customer",
      },
      { status: 500 }
    )
  }
}
