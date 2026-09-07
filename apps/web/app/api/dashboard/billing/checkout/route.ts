import { NextRequest, NextResponse } from "next/server"

import { getAuthenticatedSession } from "@/lib/auth/session"
import { createProCheckout } from "@/lib/billing/subscription-service"

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthenticatedSession(request)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const origin = new URL(request.url).origin

    const checkout = await createProCheckout({
      userId: session.userId,
      successUrl: `${origin}/dashboard/billing/success`,
      cancelUrl: `${origin}/dashboard/billing`,
    })

    return NextResponse.json({
      url: checkout.checkoutUrl,
    })
  } catch (error) {
    console.error("Create Pro checkout error:", error)

    const message =
      error instanceof Error ? error.message : "Unable to start checkout"

    return NextResponse.json({ error: message }, { status: 400 })
  }
}
