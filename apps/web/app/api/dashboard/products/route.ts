import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@repo/db"
import { getAuthenticatedSession } from "@/lib/auth/session"

interface JwtPayload {
  userId: string
  role?: string
  class?: string
}

/**
 * GET /api/dashboard/products
 *
 * Returns all products belonging to the authenticated user.
 *
 * Optional:
 * ?search=website
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedSession(request)

    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)

    const search = searchParams.get("search")?.trim() ?? ""

    const page = Math.max(
      Number.parseInt(searchParams.get("page") ?? "1", 10) || 1,
      1
    )

    const pageSize = Math.min(
      Math.max(
        Number.parseInt(searchParams.get("pageSize") ?? "10", 10) || 10,
        1
      ),
      100
    )

    const skip = (page - 1) * pageSize

    const where = {
      userId: auth.userId,
      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                description: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
    }

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          rate: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          name: "asc",
        },
        skip,
        take: pageSize,
      }),

      prisma.product.count({
        where,
      }),
    ])

    const totalPages = Math.ceil(total / pageSize)

    return NextResponse.json({
      products,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    })
  } catch (error) {
    console.error("GET /api/dashboard/products error:", error)

    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/dashboard/products
 *
 * Creates a new product for the authenticated user.
 */
export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedSession(request)

  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const body = await request.json()

    const name = typeof body.name === "string" ? body.name.trim() : ""

    const description =
      typeof body.description === "string" ? body.description.trim() : null

    const rate = body.rate

    if (!name) {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 }
      )
    }

    if (
      rate === undefined ||
      rate === null ||
      rate === "" ||
      Number.isNaN(Number(rate)) ||
      Number(rate) < 0
    ) {
      return NextResponse.json(
        { error: "A valid product rate is required" },
        { status: 400 }
      )
    }

    const product = await prisma.product.create({
      data: {
        userId: auth.userId,
        name,
        description: description || null,
        rate: Number(rate),
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

    return NextResponse.json(
      {
        product,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Failed to create product:", error)

    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    )
  }
}
