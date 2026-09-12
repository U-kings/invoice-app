import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@repo/db"
import { getAuthenticatedSession } from "@/lib/auth/session"

const REMINDER_BATCH_SIZE = 100

export async function GET(request: NextRequest) {
  try {
    // ---------------------------------------------------------
    // 1. Authentication
    // ---------------------------------------------------------

    const auth = await getAuthenticatedSession(request)

    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // ---------------------------------------------------------
    // 2. Query parameters
    // ---------------------------------------------------------

    const { searchParams } = new URL(request.url)

    const search =
      searchParams.get("search")?.trim() || ""

    const type =
      searchParams.get("type")?.trim() || ""

    const page = Math.max(
      Number(searchParams.get("page")) || 1,
      1
    )

    const pageSize = Math.min(
      Math.max(
        Number(searchParams.get("pageSize")) || 10,
        1
      ),
      REMINDER_BATCH_SIZE
    )

    const skip = (page - 1) * pageSize

    // ---------------------------------------------------------
    // 3. Build table filter
    //
    // Search and type filters only affect the table.
    // ---------------------------------------------------------

    const reminderWhere = {
      userId: auth.userId,

      ...(search
        ? {
            OR: [
              {
                invoice: {
                  invoiceNumber: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
              },
              {
                invoice: {
                  customer: {
                    name: {
                      contains: search,
                      mode: "insensitive" as const,
                    },
                  },
                },
              },
              {
                invoice: {
                  customer: {
                    email: {
                      contains: search,
                      mode: "insensitive" as const,
                    },
                  },
                },
              },
            ],
          }
        : {}),

      ...(type
        ? {
            type: type as
              | "BEFORE_DUE"
              | "DUE_DATE"
              | "OVERDUE",
          }
        : {}),
    }

    // ---------------------------------------------------------
    // 4. Stats filter
    //
    // Stats represent ALL reminders belonging to the user.
    // Search and type filters do NOT affect these counts.
    // ---------------------------------------------------------

    const statsWhere = {
      userId: auth.userId,
    }

    // ---------------------------------------------------------
    // 5. Fetch reminders + pagination + stats
    // ---------------------------------------------------------

    const [
      reminders,
      total,
      scheduled,
      processing,
      sent,
      failed,
    ] = await prisma.$transaction([
      // -------------------------------------------------------
      // Table data
      // -------------------------------------------------------

      prisma.invoiceReminder.findMany({
        where: reminderWhere,

        orderBy: {
          scheduledFor: "asc",
        },

        skip,
        take: pageSize,

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
      }),

      // -------------------------------------------------------
      // Filtered total for pagination
      // -------------------------------------------------------

      prisma.invoiceReminder.count({
        where: reminderWhere,
      }),

      // -------------------------------------------------------
      // Scheduled
      //
      // Not sent
      // Not currently processing
      // No previous error
      // -------------------------------------------------------

      prisma.invoiceReminder.count({
        where: {
          ...statsWhere,

          sentAt: null,
          processingAt: null,
          lastError: null,
        },
      }),

      // -------------------------------------------------------
      // Processing
      //
      // Not sent
      // Currently claimed/processing
      // -------------------------------------------------------

      prisma.invoiceReminder.count({
        where: {
          ...statsWhere,

          sentAt: null,

          processingAt: {
            not: null,
          },
        },
      }),

      // -------------------------------------------------------
      // Sent
      // -------------------------------------------------------

      prisma.invoiceReminder.count({
        where: {
          ...statsWhere,

          sentAt: {
            not: null,
          },
        },
      }),

      // -------------------------------------------------------
      // Failed
      //
      // Has an error and has not successfully been sent.
      // -------------------------------------------------------

      prisma.invoiceReminder.count({
        where: {
          ...statsWhere,

          sentAt: null,

          lastError: {
            not: null,
          },
        },
      }),
    ])

    // ---------------------------------------------------------
    // 6. Pagination
    // ---------------------------------------------------------

    const totalPages = Math.ceil(
      total / pageSize
    )

    // ---------------------------------------------------------
    // 7. Response
    // ---------------------------------------------------------

    return NextResponse.json({
      data: reminders,

      stats: {
        scheduled,
        processing,
        sent,
        failed,
      },

      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    })
  } catch (error) {
    console.error(
      "Get invoice reminders error:",
      error
    )

    return NextResponse.json(
      {
        error: "Failed to fetch invoice reminders.",
      },
      {
        status: 500,
      }
    )
  }
}