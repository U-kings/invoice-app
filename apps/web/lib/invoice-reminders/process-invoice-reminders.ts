import { prisma } from "@repo/db"
import { sendInvoiceReminderEmail } from "./send-invoice-reminder-email"

const REMINDER_BATCH_SIZE = 50
const PROCESSING_TIMEOUT_MS = 10 * 60 * 1000

export async function processInvoiceReminders() {
  const now = new Date()

  const processingTimeout = new Date(
    now.getTime() - PROCESSING_TIMEOUT_MS
  )

  const reminders = await prisma.invoiceReminder.findMany({
    where: {
      scheduledFor: {
        lte: now,
      },

      sentAt: null,

      OR: [
        {
          processingAt: null,
        },
        {
          processingAt: {
            lt: processingTimeout,
          },
        },
      ],
    },

    orderBy: {
      scheduledFor: "asc",
    },

    take: REMINDER_BATCH_SIZE,

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

  let processed = 0
  let failed = 0

  for (const reminder of reminders) {
    // ----------------------------------------------
    // Skip reminders for completed invoices
    // ----------------------------------------------

    if (
      reminder.invoice.status === "PAID" ||
      reminder.invoice.status === "CANCELLED"
    ) {
      await prisma.invoiceReminder.delete({
        where: {
          id: reminder.id,
        },
      })

      continue
    }

    // ----------------------------------------------
    // Claim reminder
    // ----------------------------------------------

    const claimed = await prisma.invoiceReminder.updateMany({
      where: {
        id: reminder.id,
        sentAt: null,

        OR: [
          {
            processingAt: null,
          },
          {
            processingAt: {
              lt: processingTimeout,
            },
          },
        ],
      },

      data: {
        processingAt: new Date(),
      },
    })

    // Another worker already claimed this reminder.
    if (claimed.count === 0) {
      continue
    }

    // ----------------------------------------------
    // Increment attempt count
    // ----------------------------------------------

    await prisma.invoiceReminder.update({
      where: {
        id: reminder.id,
      },

      data: {
        attempts: {
          increment: 1,
        },

        lastError: null,
      },
    })

    try {
      // ----------------------------------------------
      // Send reminder email
      // ----------------------------------------------

      await sendInvoiceReminderEmail({
        reminder,
      })

      // ----------------------------------------------
      // Mark reminder as sent
      // ----------------------------------------------

      await prisma.invoiceReminder.update({
        where: {
          id: reminder.id,
        },

        data: {
          sentAt: new Date(),
          processingAt: null,
          lastError: null,
        },
      })

      processed++
    } catch (error) {
      failed++

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown error while sending invoice reminder"

      console.error(
        `Failed to process reminder ${reminder.id} (attempt ${reminder.attempts + 1}):`,
        error
      )

      // ----------------------------------------------
      // Save failure and release claim
      // ----------------------------------------------

      try {
        await prisma.invoiceReminder.update({
          where: {
            id: reminder.id,
          },

          data: {
            processingAt: null,
            lastError: errorMessage,
          },
        })
      } catch (updateError) {
        console.error(
          `Failed to save reminder error ${reminder.id}:`,
          updateError
        )
      }
    }
  }

  return {
    found: reminders.length,
    processed,
    failed,
  }
}
