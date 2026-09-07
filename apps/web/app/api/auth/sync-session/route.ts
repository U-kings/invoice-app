import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@repo/db"
import jwt from "jsonwebtoken"
import { verifyAuthToken } from "@/lib/auth" // Adjust this path to your actual auth file

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value
    const verifiedToken = await verifyAuthToken(token)

    // 1. Guard against unauthenticated requests
    if (!verifiedToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Fetch the fresh subscription status directly from the database
    const freshUser = await prisma.user.findUnique({
      where: { id: verifiedToken.userId },
      include: { subscription: true }
    })

    if (!freshUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const currentStatus = freshUser.subscription?.status || "EXPIRED"

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      throw new Error("JWT_SECRET environment variable is missing from configuration.")
    }

    // 3. Mint a fresh token containing the exact payload structure your login route uses
    const newToken = jwt.sign(
      {
        userId: verifiedToken.userId,
        role: verifiedToken.role,
        class: verifiedToken.class,
        sessionId: verifiedToken.sessionId,
        subscriptionStatus: currentStatus, // 🚀 Injecting the brand-new status from the DB
      },
      jwtSecret,
      {
        expiresIn: "7d",
      }
    )

    // 4. Build response package
    const response = NextResponse.json({
      success: true,
      subscriptionStatus: currentStatus
    })

    // 5. Overwrite the old token cookie with the updated permissions
    response.cookies.set("token", newToken, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
    })

    return response
  } catch (error: any) {
    console.error("💥 Session sync endpoint crashed:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
