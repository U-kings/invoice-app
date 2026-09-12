import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@repo/db"
import { businessProfileSchema } from "@/components/settings/settings-schema"
import { getAuthenticatedSession } from "@/lib/auth/session"

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedSession(request)

    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const businessProfile = await prisma.businessProfile.findUnique({
      where: {
        userId: auth.userId,
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

export async function PATCH(request: NextRequest) {
  try {
    const auth = await getAuthenticatedSession(request)

    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }
    const body = await request.json()

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
        userId: auth.userId,
      },

      create: {
        userId: auth.userId,
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
        logoPublicId: true,
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
