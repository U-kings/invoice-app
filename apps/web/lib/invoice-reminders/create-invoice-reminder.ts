import { prisma, Prisma } from "@repo/db"
import { scheduleInvoiceReminders } from "./schedule-invoice-reminders"

type InvoiceReminderSettings = {
  enabled: boolean
  beforeDueEnabled: boolean
  beforeDueDays: number
  dueDateEnabled: boolean
  overdueEnabled: boolean
  overdueAfterDays: number
  overdueRepeatDays: number
  maxOverdueReminders: number
}

type CreateInvoiceRemindersParams = {
  invoiceId: string
  userId: string
  issueDate: Date
  dueDate: Date
  settings: InvoiceReminderSettings
}

export async function createInvoiceReminders({
  invoiceId,
  userId,
  issueDate,
  dueDate,
  settings,
}: CreateInvoiceRemindersParams) {
  return prisma.$transaction(
    async (tx) => {
      return scheduleInvoiceReminders({
        tx,
        invoiceId,
        userId,
        issueDate,
        dueDate,
        settings,
      })
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  )
}