import { NextRequest, NextResponse } from "next/server"
import { processInvoiceReminders } from "@/lib/invoice-reminders/process-invoice-reminders"

export async function GET(req: NextRequest) {
  try {
    const authorization =
      req.headers.get("authorization")

    const cronSecret =
      process.env.CRON_SECRET

    if (!cronSecret) {
      return NextResponse.json(
        {
          error: "CRON_SECRET is not configured",
        },
        { status: 500 }
      )
    }

    if (
      authorization !==
      `Bearer ${cronSecret}`
    ) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        { status: 401 }
      )
    }

    const result =
      await processInvoiceReminders()

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error(
      "Process invoice reminders error:",
      error
    )

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to process invoice reminders",
      },
      { status: 500 }
    )
  }
}