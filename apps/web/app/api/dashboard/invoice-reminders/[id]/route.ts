import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@repo/db"
import { getAuthenticatedSession } from "@/lib/auth/session"

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    // ---------------------------------------------------------
    // 1. Authentication
    // ---------------------------------------------------------

    const auth = await getAuthenticatedSession(request)

    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // ---------------------------------------------------------
    // 2. Get reminder ID
    // ---------------------------------------------------------

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        {
          error: "Reminder ID is required.",
        },
        {
          status: 400,
        }
      )
    }

    // ---------------------------------------------------------
    // 3. Fetch reminder
    // ---------------------------------------------------------

    const reminder = await prisma.invoiceReminder.findFirst({
      where: {
        id,
        userId: auth.userId,
      },

      include: {
        invoice: {
          include: {
            customer: true,
            lineItems: true,
          },
        },

        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    if (!reminder) {
      return NextResponse.json(
        {
          error: "Invoice reminder not found.",
        },
        {
          status: 404,
        }
      )
    }

    // ---------------------------------------------------------
    // 4. Response
    // ---------------------------------------------------------

    return NextResponse.json({
      data: reminder,
    })
  } catch (error) {
    console.error("Get invoice reminder error:", error)

    return NextResponse.json(
      {
        error: "Failed to fetch invoice reminder.",
      },
      {
        status: 500,
      }
    )
  }
}