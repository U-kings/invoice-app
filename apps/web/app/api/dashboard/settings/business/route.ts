import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { prisma } from "@repo/db"
import { businessProfileSchema } from "@/components/settings/settings-schema"

interface AuthPayload {
  userId: string
}

async function getAuthenticatedUserId(req: NextRequest) {
  const token = req.cookies.get("token")?.value

  if (!token) {
    return null
  }

  const jwtSecret = process.env.JWT_SECRET

  if (!jwtSecret) {
    throw new Error("JWT_SECRET environment variable is missing")
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as AuthPayload

    return decoded.userId || null
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req)

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const businessProfile = await prisma.businessProfile.findUnique({
      where: {
        userId,
      },
    })

    return NextResponse.json({
      businessProfile,
    })
  } catch (error) {
    console.error("Get business profile error:", error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch business profile",
      },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req)

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    const result = businessProfileSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid business profile data",
          issues: result.error.flatten(),
        },
        { status: 400 }
      )
    }

    const data = result.data

    const businessProfile = await prisma.businessProfile.upsert({
      where: {
        userId,
      },

      create: {
        userId,
        ...data,
      },

      update: {
        ...data,
      },

      select: {
        id: true,
        businessName: true,
        countryCode: true,
        currency: true,
        email: true,
        phone: true,
        website: true,
        address: true,
        city: true,
        state: true,
        postalCode: true,
        taxId: true,
        logoUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      message: "Business profile updated successfully",
      businessProfile,
    })
  } catch (error) {
    console.error("Update business profile error:", error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update business profile",
      },
      { status: 500 }
    )
  }
}
