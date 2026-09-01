import { prisma } from "@repo/db"

export const DEFAULT_INVOICE_REMINDER_SETTINGS = {
  enabled: true,

  beforeDueEnabled: true,
  beforeDueDays: 3,

  dueDateEnabled: true,

  overdueEnabled: true,
  overdueAfterDays: 1,
  overdueRepeatDays: 7,
  maxOverdueReminders: 3,

  emailSubject: null,
  emailMessage: null,
} as const

export async function getInvoiceReminderSettings(userId: string) {
  const settings = await prisma.invoiceReminderSettings.findUnique({
    where: {
      userId,
    },
  })

  return settings ?? DEFAULT_INVOICE_REMINDER_SETTINGS
}