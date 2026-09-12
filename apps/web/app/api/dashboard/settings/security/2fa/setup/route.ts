import { NextRequest, NextResponse } from "next/server"
import QRCode from "qrcode"
import { prisma } from "@repo/db"
import { generateTwoFactorSecret } from "@/lib/auth/two-factor"
import { getAuthenticatedSession } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedSession(request)

    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: {
        id: auth.userId,
      },
      select: {
        id: true,
        email: true,
        userTwoFactor: {
          select: {
            enabled: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.userTwoFactor?.enabled) {
      return NextResponse.json(
        { error: "Two-factor authentication is already enabled" },
        { status: 400 }
      )
    }

    const { secret, otpauthUrl } = generateTwoFactorSecret(user.email)

    const qrCode = await QRCode.toDataURL(otpauthUrl)

    await prisma.userTwoFactor.upsert({
      where: {
        userId: user.id,
      },
      create: {
        userId: user.id,
        secret,
        enabled: false,
        recoveryCodes: [],
      },
      update: {
        secret,
        enabled: false,
        recoveryCodes: [],
      },
    })

    return NextResponse.json({
      qrCode,
      secret,
    })
  } catch (error) {
    console.error("2FA setup error:", error)

    return NextResponse.json(
      { error: "Failed to set up two-factor authentication" },
      { status: 500 }
    )
  }
}
