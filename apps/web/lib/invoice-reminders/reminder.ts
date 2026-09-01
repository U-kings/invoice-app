import type {
  InvoiceReminder,
  InvoiceReminderStatus,
} from "@/hooks/use-invoice-reminders"

export function getInvoiceReminderStatus(
  reminder: InvoiceReminder
): InvoiceReminderStatus {
  if (reminder.sentAt) {
    return "SENT"
  }

  if (reminder.processingAt) {
    return "PROCESSING"
  }

  if (reminder.lastError) {
    return "FAILED"
  }

  return "SCHEDULED"
}

export function getReminderTypeLabel(type: InvoiceReminder["type"]) {
  switch (type) {
    case "BEFORE_DUE":
      return "Before due"

    case "DUE_DATE":
      return "Due date"

    case "OVERDUE":
      return "Overdue"
  }
}
