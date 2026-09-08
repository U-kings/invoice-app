import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@repo/db"
import { paymentRouter } from "@workspace/payment-adapters"
import { getAuthenticatedSession } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthenticatedSession(request)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const subscription = await prisma.subscription.findUnique({
      where: {
        userId: session.userId,
      },
    })

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found." },
        { status: 404 }
      )
    }

    if (subscription.plan !== "PRO") {
      return NextResponse.json(
        {
          error: "You do not have an active Pro subscription.",
        },
        { status: 400 }
      )
    }

    if (!subscription.provider) {
      return NextResponse.json(
        {
          error: "No payment provider is associated with this subscription.",
        },
        { status: 400 }
      )
    }

    if (!subscription.providerSubscriptionId) {
      return NextResponse.json(
        {
          error:
            "Your payment subscription is not ready yet. Please try again shortly.",
        },
        { status: 400 }
      )
    }

    const provider = paymentRouter.resolve({
      currency: "NGN",
      businessCountry: "NG",
    })

    const result = await provider.manageSubscription(
      subscription.providerSubscriptionId
    )

    return NextResponse.json({
      url: result.url,
    })
  } catch (error) {
    console.error("Create subscription management link error:", error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to open subscription management.",
      },
      { status: 400 }
    )
  }
}
