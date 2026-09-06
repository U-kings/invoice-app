import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { prisma } from "@repo/db"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      )
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as {
      userId: string
    }

    // 1. Fetch current 2FA status
    const userTwoFactor = await prisma.userTwoFactor.findUnique({
      where: {
        userId: decoded.userId,
      },
    })

    // 2. Check if 2FA is already turned off or doesn't exist
    if (!userTwoFactor || !userTwoFactor.enabled) {
      return NextResponse.json(
        { error: "Two-factor authentication is not enabled" },
        { status: 400 },
      )
    }

    // 3. Disable 2FA by updating the record
    await prisma.userTwoFactor.update({
      where: {
        userId: decoded.userId,
      },
      data: {
        enabled: false,
        secret: null,        // Clear secret for security
        recoveryCodes: [],   // Wipe old recovery codes
      },
    })

    return NextResponse.json({
      message: "Two-factor authentication has been successfully disabled.",
    })
  } catch (error) {
    console.error("2FA disable error:", error)

    return NextResponse.json(
      { error: "Failed to disable two-factor authentication" },
      { status: 500 },
    )
  }
}
