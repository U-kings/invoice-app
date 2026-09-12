import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@repo/db"
import { getAuthenticatedSession } from "@/lib/auth/session"

interface JwtPayload {
  userId: string
  role?: string
  class?: string
}

interface RouteContext {
  params: Promise<{
    productId: string
  }>
}

/**
 * GET /api/dashboard/products/[productId]
 */
export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await getAuthenticatedSession(request)

  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { productId } = await context.params

  try {
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        userId: auth.userId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        rate: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({
      product,
    })
  } catch (error) {
    console.error("Failed to fetch product:", error)

    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/dashboard/products/[productId]
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await getAuthenticatedSession(request)

  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { productId } = await context.params

  try {
    const body = await request.json()

    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        userId: auth.userId,
      },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const data: {
      name?: string
      description?: string | null
      rate?: number
    } = {}

    if (body.name !== undefined) {
      if (typeof body.name !== "string" || !body.name.trim()) {
        return NextResponse.json(
          { error: "Product name cannot be empty" },
          { status: 400 }
        )
      }

      data.name = body.name.trim()
    }

    if (body.description !== undefined) {
      if (body.description !== null && typeof body.description !== "string") {
        return NextResponse.json(
          { error: "Invalid product description" },
          { status: 400 }
        )
      }

      data.description =
        typeof body.description === "string"
          ? body.description.trim() || null
          : null
    }

    if (body.rate !== undefined) {
      if (
        body.rate === null ||
        body.rate === "" ||
        Number.isNaN(Number(body.rate)) ||
        Number(body.rate) < 0
      ) {
        return NextResponse.json(
          { error: "Invalid product rate" },
          { status: 400 }
        )
      }

      data.rate = Number(body.rate)
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      )
    }

    const product = await prisma.product.update({
      where: {
        id: productId,
      },
      data,
      select: {
        id: true,
        name: true,
        description: true,
        rate: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      product,
    })
  } catch (error) {
    console.error("Failed to update product:", error)

    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/dashboard/products/[productId]
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = await getAuthenticatedSession(request)

  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }
  const { productId } = await context.params

  try {
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        userId: auth.userId,
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    await prisma.product.delete({
      where: {
        id: productId,
      },
    })

    return NextResponse.json({
      message: "Product deleted successfully",
    })
  } catch (error) {
    console.error("Failed to delete product:", error)

    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    )
  }
}
