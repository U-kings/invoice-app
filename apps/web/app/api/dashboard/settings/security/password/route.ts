import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

import { prisma } from "@repo/db"

type JwtPayload = {
  userId: string
  role?: string
  class?: string | null
}

type ChangePasswordBody = {
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

export async function PATCH(request: NextRequest) {
  try {
    // ------------------------------------------------------------
    // Authenticate user
    // ------------------------------------------------------------
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let decoded: JwtPayload

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401 }
      )
    }

    if (!decoded.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // ------------------------------------------------------------
    // Parse request body
    // ------------------------------------------------------------
    let body: ChangePasswordBody

    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      )
    }

    const { currentPassword, newPassword, confirmPassword } = body

    // ------------------------------------------------------------
    // Validate input
    // ------------------------------------------------------------
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "All password fields are required" },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters" },
        { status: 400 }
      )
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "New passwords do not match" },
        { status: 400 }
      )
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: "New password must be different from your current password" },
        { status: 400 }
      )
    }

    // ------------------------------------------------------------
    // Find authenticated user
    // ------------------------------------------------------------
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
      select: {
        id: true,
        password: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // ------------------------------------------------------------
    // Verify current password
    // ------------------------------------------------------------
    if (!user.password) {
      return NextResponse.json(
        { error: "Password authentication is not available for this account" },
        { status: 400 }
      )
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    )

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      )
    }

    // ------------------------------------------------------------
    // Hash new password
    // ------------------------------------------------------------
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // ------------------------------------------------------------
    // Update password
    // ------------------------------------------------------------
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    })
  } catch (error) {
    console.error("Change password error:", error)

    return NextResponse.json(
      { error: "Failed to update password" },
      { status: 500 }
    )
  }
}
