import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@repo/db"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { verifyTwoFactorToken } from "@/lib/auth/two-factor"

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { code } = await req.json()
    const tempToken = req.cookies.get("temp_token")?.value

    if (!tempToken) {
      return NextResponse.json(
        { error: "Session expired. Please log in again." },
        { status: 401 }
      )
    }

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Verification code is required" },
        { status: 400 }
      )
    }

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      throw new Error("JWT_SECRET environment variable is missing.")
    }

    // 1. Verify the temporary pre-auth token
    let decoded: { userId: string; isPreAuth?: boolean }
    try {
      decoded = jwt.verify(tempToken, jwtSecret) as { userId: string; isPreAuth?: boolean }
      if (!decoded.isPreAuth) throw new Error()
    } catch {
      return NextResponse.json(
        { error: "Invalid session context. Please log in again." },
        { status: 401 }
      )
    }

    // 2. Query the user profile along with their credentials/2FA configuration
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { userTwoFactor: true },
    })

    if (!user || !user.userTwoFactor || !user.userTwoFactor.enabled) {
      return NextResponse.json(
        { error: "Two-factor authentication is not active for this user." },
        { status: 400 }
      )
    }

    const cleanCode = code.trim()
    let isValid = false
    let usedRecoveryCode: string | null = null

    // 3. Evaluate code type (6-digit TOTP token vs Backup Recovery Code)
    if (/^\d{6}$/.test(cleanCode)) {
      if (!user.userTwoFactor.secret) {
        return NextResponse.json(
          { error: "2FA configuration is missing setup fields." },
          { status: 400 }
        )
      }
      isValid = await verifyTwoFactorToken(user.userTwoFactor.secret, cleanCode)
    } else {
      // Check against your array of bcrypt-hashed recovery codes
      for (const hashedCode of user.userTwoFactor.recoveryCodes) {
        const match = await bcrypt.compare(cleanCode, hashedCode)
        if (match) {
          isValid = true
          usedRecoveryCode = hashedCode
          break
        }
      }
    }

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid verification code. Please try again." },
        { status: 400 }
      )
    }

    // 4. Burn the recovery code if it was used so it can't be reused
    if (usedRecoveryCode) {
      await prisma.userTwoFactor.update({
        where: { userId: user.id },
        data: {
          recoveryCodes: {
            set: user.userTwoFactor.recoveryCodes.filter((c) => c !== usedRecoveryCode),
          },
        },
      })
    }

    // 5. Build and distribute the permanent 7-day session token
    const token: string = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        class: user.class,
      },
      jwtSecret,
      { expiresIn: "7d" }
    )

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, userTwoFactor, ...publicUser } = user

    const response = NextResponse.json({
      message: "Two-factor verification successful",
      user: publicUser,
      access_token: token,
    })

    // 6. Set permanent session cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    // 7. Expire the temporary pre-auth cookie
    response.cookies.set("temp_token", "", {
      path: "/",
      maxAge: 0,
    })

    return response
  } catch (err: unknown) {
    console.error("2FA Login Verification Route Error:", err)
    const errorMessage =
      err instanceof Error ? err.message : "An unexpected server error occurred"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
