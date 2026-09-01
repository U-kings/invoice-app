import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { prisma } from "@repo/db"

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
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user,
    })
  } catch (error) {
    console.error("Get profile error:", error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch profile",
      },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req)

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()

    const {
      firstName,
      middleName,
      lastName,
      phoneNumber,
    } = body

    if (!firstName?.trim()) {
      return NextResponse.json(
        { error: "First name is required" },
        { status: 400 }
      )
    }

    if (!lastName?.trim()) {
      return NextResponse.json(
        { error: "Last name is required" },
        { status: 400 }
      )
    }

    if (!phoneNumber?.trim()) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      )
    }

    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        firstName: firstName.trim(),
        middleName: middleName?.trim() || null,
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
      },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
      },
    })

    return NextResponse.json({
      message: "Profile updated successfully",
      user,
    })
  } catch (error) {
    console.error("Update profile error:", error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update profile",
      },
      { status: 500 }
    )
  }
}