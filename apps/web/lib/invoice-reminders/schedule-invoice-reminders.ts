import { prisma, Prisma } from "@repo/db"

type ScheduleInvoiceRemindersParams = {
  tx: Prisma.TransactionClient
  invoiceId: string
  userId: string
  issueDate: Date
  dueDate: Date
  settings: {
    enabled: boolean
    beforeDueEnabled: boolean
    beforeDueDays: number
    dueDateEnabled: boolean
    overdueEnabled: boolean
    overdueAfterDays: number
    overdueRepeatDays: number
    maxOverdueReminders: number
  }
}

export async function scheduleInvoiceReminders({
  tx,
  invoiceId,
  userId,
  issueDate,
  dueDate,
  settings,
}: ScheduleInvoiceRemindersParams) {
  // --------------------------------------------------
  // Reminders are completely disabled
  // --------------------------------------------------

  if (!settings.enabled) {
    return []
  }

  const reminders: Prisma.InvoiceReminderCreateManyInput[] = []

  // --------------------------------------------------
  // Helper
  // --------------------------------------------------

  function addReminder(
    type: "BEFORE_DUE" | "DUE_DATE" | "OVERDUE",
    scheduledFor: Date
  ) {
    // Don't schedule reminders in the past.
    if (scheduledFor <= new Date()) {
      return
    }

    // Don't schedule a reminder before the invoice was issued.
    if (scheduledFor < issueDate) {
      return
    }

    reminders.push({
      invoiceId,
      userId,
      type,
      scheduledFor,
    })
  }

  // --------------------------------------------------
  // Before due
  // --------------------------------------------------

  if (settings.beforeDueEnabled && settings.beforeDueDays > 0) {
    const beforeDueDate = new Date(dueDate)

    beforeDueDate.setDate(beforeDueDate.getDate() - settings.beforeDueDays)

    addReminder("BEFORE_DUE", beforeDueDate)
  }

  // --------------------------------------------------
  // Due date
  // --------------------------------------------------

  if (settings.dueDateEnabled) {
    addReminder("DUE_DATE", new Date(dueDate))
  }

  // --------------------------------------------------
  // Overdue reminders
  // --------------------------------------------------

  if (
    settings.overdueEnabled &&
    settings.overdueAfterDays >= 0 &&
    settings.maxOverdueReminders > 0
  ) {
    const firstOverdueDate = new Date(dueDate)

    firstOverdueDate.setDate(
      firstOverdueDate.getDate() + settings.overdueAfterDays
    )

    for (let index = 0; index < settings.maxOverdueReminders; index++) {
      const overdueDate = new Date(firstOverdueDate)

      overdueDate.setDate(
        overdueDate.getDate() + index * settings.overdueRepeatDays
      )

      addReminder("OVERDUE", overdueDate)
    }
  }

  // --------------------------------------------------
  // Nothing to create
  // --------------------------------------------------

  if (reminders.length === 0) {
    return []
  }

  // --------------------------------------------------
  // Create reminders
  // --------------------------------------------------

  await tx.invoiceReminder.createMany({
    // await prisma.invoiceReminder.createMany({
    data: reminders,
  })

  return reminders
}
