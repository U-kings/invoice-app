import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

import { prisma } from "@repo/db"

export async function GET(request: NextRequest) {
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
    ) as { userId: string }

    const twoFactor = await prisma.userTwoFactor.findUnique({
      where: {
        userId: decoded.userId,
      },
      select: {
        enabled: true,
      },
    })

    return NextResponse.json({
      enabled: twoFactor?.enabled ?? false,
    })
  } catch (error) {
    console.error("2FA status error:", error)

    return NextResponse.json(
      { error: "Failed to fetch two-factor authentication status" },
      { status: 500 },
    )
  }
}