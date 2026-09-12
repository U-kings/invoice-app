import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@repo/db"
import { getAuthenticatedSession } from "@/lib/auth/session"

/**
 * GET /api/dashboard/settings/invoice-reminders
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedSession(request)

    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const settings = await prisma.invoiceReminderSettings.findUnique({
      where: {
        userId: auth.userId,
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
    console.error("Get invoice reminder settings error:", error)

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
export async function PATCH(request: NextRequest) {
  try {
    const auth = await getAuthenticatedSession(request)

    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()

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
          error: "Before due days must be an integer between 1 and 30",
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
          error: "Overdue days must be an integer between 1 and 30",
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
          error: "Overdue repeat days must be an integer between 1 and 90",
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
          error: "Maximum overdue reminders must be between 1 and 10",
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

    const settings = await prisma.invoiceReminderSettings.upsert({
      where: {
        userId: auth.userId,
      },

      create: {
        userId: auth.userId,
        enabled,
        beforeDueEnabled,
        beforeDueDays,
        dueDateEnabled,
        overdueEnabled,
        overdueAfterDays,
        overdueRepeatDays,
        maxOverdueReminders,
        emailSubject:
          typeof emailSubject === "string" ? emailSubject.trim() || null : null,
        emailMessage:
          typeof emailMessage === "string" ? emailMessage.trim() || null : null,
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
          typeof emailSubject === "string" ? emailSubject.trim() || null : null,
        emailMessage:
          typeof emailMessage === "string" ? emailMessage.trim() || null : null,
      },
    })

    return NextResponse.json({
      message: "Invoice reminder settings updated successfully",
      settings,
    })
  } catch (error) {
    console.error("Update invoice reminder settings error:", error)

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
