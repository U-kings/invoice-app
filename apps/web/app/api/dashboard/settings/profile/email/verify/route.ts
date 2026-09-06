import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@repo/db"

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token")

    if (!token) {
      return NextResponse.redirect(
        new URL(
          "/dashboard/settings?emailChange=invalid",
          request.url,
        ),
      )
    }

    const user = await prisma.user.findFirst({
      where: {
        emailChangeToken: token,
        emailChangeTokenExpires: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        pendingEmail: true,
      },
    })

    if (!user || !user.pendingEmail) {
      return NextResponse.redirect(
        new URL(
          "/dashboard/settings?emailChange=expired",
          request.url,
        ),
      )
    }

    const emailAlreadyUsed = await prisma.user.findFirst({
      where: {
        email: user.pendingEmail,
        NOT: {
          id: user.id,
        },
      },
      select: {
        id: true,
      },
    })

    if (emailAlreadyUsed) {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          pendingEmail: null,
          emailChangeToken: null,
          emailChangeTokenExpires: null,
        },
      })

      return NextResponse.redirect(
        new URL(
          "/dashboard/settings?emailChange=already-used",
          request.url,
        ),
      )
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        email: user.pendingEmail,
        pendingEmail: null,
        emailChangeToken: null,
        emailChangeTokenExpires: null,

        // The new address has now been verified.
        isVerified: true,
      },
    })

    return NextResponse.redirect(
      new URL(
        "/dashboard/settings?emailChange=success",
        request.url,
      ),
    )
  } catch (error) {
    console.error("Email verification error:", error)

    return NextResponse.redirect(
      new URL(
        "/dashboard/settings?emailChange=error",
        request.url,
      ),
    )
  }
}