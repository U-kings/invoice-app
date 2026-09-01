import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { prisma } from "@repo/db"

interface AuthPayload {
  userId: string
}

async function getAuthenticatedUserId(req: NextRequest) {
  const token = req.cookies.get("token")?.value

  if (!token) {
    return null
  }

  const jwtSecret = process.env.JWT_SECRET

  if (!jwtSecret) {
    throw new Error("JWT_SECRET environment variable is missing")
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as AuthPayload

    return decoded.userId || null
  } catch {
    return null
  }
}

/**
 * GET /api/dashboard/settings/invoice-reminders
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req)

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const settings =
      await prisma.invoiceReminderSettings.findUnique({
        where: {
          userId,
        },
      })

    /**
     * Settings may not exist yet for a new user.
     *
     * Return null rather than treating that as an error.
     * The frontend can then use the schema defaults.
     */
    return NextResponse.json({
      settings,
    })
  } catch (error) {
    console.error(
      "Get invoice reminder settings error:",
      error
    )

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch invoice reminder settings",
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/dashboard/settings/invoice-reminders
 */
export async function PATCH(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req)

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()

    const {
      enabled,
      beforeDueEnabled,
      beforeDueDays,
      dueDateEnabled,
      overdueEnabled,
      overdueAfterDays,
      overdueRepeatDays,
      maxOverdueReminders,
      emailSubject,
      emailMessage,
    } = body

    // ----------------------------------------
    // Validation
    // ----------------------------------------

    if (typeof enabled !== "boolean") {
      return NextResponse.json(
        { error: "Invalid enabled value" },
        { status: 400 }
      )
    }

    if (typeof beforeDueEnabled !== "boolean") {
      return NextResponse.json(
        { error: "Invalid beforeDueEnabled value" },
        { status: 400 }
      )
    }

    if (
      !Number.isInteger(beforeDueDays) ||
      beforeDueDays < 1 ||
      beforeDueDays > 30
    ) {
      return NextResponse.json(
        {
          error:
            "Before due days must be an integer between 1 and 30",
        },
        { status: 400 }
      )
    }

    if (typeof dueDateEnabled !== "boolean") {
      return NextResponse.json(
        { error: "Invalid dueDateEnabled value" },
        { status: 400 }
      )
    }

    if (typeof overdueEnabled !== "boolean") {
      return NextResponse.json(
        { error: "Invalid overdueEnabled value" },
        { status: 400 }
      )
    }

    if (
      !Number.isInteger(overdueAfterDays) ||
      overdueAfterDays < 1 ||
      overdueAfterDays > 30
    ) {
      return NextResponse.json(
        {
          error:
            "Overdue days must be an integer between 1 and 30",
        },
        { status: 400 }
      )
    }

    if (
      !Number.isInteger(overdueRepeatDays) ||
      overdueRepeatDays < 1 ||
      overdueRepeatDays > 90
    ) {
      return NextResponse.json(
        {
          error:
            "Overdue repeat days must be an integer between 1 and 90",
        },
        { status: 400 }
      )
    }

    if (
      !Number.isInteger(maxOverdueReminders) ||
      maxOverdueReminders < 1 ||
      maxOverdueReminders > 10
    ) {
      return NextResponse.json(
        {
          error:
            "Maximum overdue reminders must be between 1 and 10",
        },
        { status: 400 }
      )
    }

    if (
      emailSubject !== null &&
      emailSubject !== undefined &&
      typeof emailSubject !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid email subject" },
        { status: 400 }
      )
    }

    if (
      emailMessage !== null &&
      emailMessage !== undefined &&
      typeof emailMessage !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid email message" },
        { status: 400 }
      )
    }

    // ----------------------------------------
    // Save settings
    // ----------------------------------------

    const settings =
      await prisma.invoiceReminderSettings.upsert({
        where: {
          userId,
        },

        create: {
          userId,
          enabled,
          beforeDueEnabled,
          beforeDueDays,
          dueDateEnabled,
          overdueEnabled,
          overdueAfterDays,
          overdueRepeatDays,
          maxOverdueReminders,
          emailSubject:
            typeof emailSubject === "string"
              ? emailSubject.trim() || null
              : null,
          emailMessage:
            typeof emailMessage === "string"
              ? emailMessage.trim() || null
              : null,
        },

        update: {
          enabled,
          beforeDueEnabled,
          beforeDueDays,
          dueDateEnabled,
          overdueEnabled,
          overdueAfterDays,
          overdueRepeatDays,
          maxOverdueReminders,
          emailSubject:
            typeof emailSubject === "string"
              ? emailSubject.trim() || null
              : null,
          emailMessage:
            typeof emailMessage === "string"
              ? emailMessage.trim() || null
              : null,
        },
      })

    return NextResponse.json({
      message: "Invoice reminder settings updated successfully",
      settings,
    })
  } catch (error) {
    console.error(
      "Update invoice reminder settings error:",
      error
    )

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update invoice reminder settings",
      },
      { status: 500 }
    )
  }
}