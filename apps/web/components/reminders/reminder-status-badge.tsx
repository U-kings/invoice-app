"use client"

import { Badge } from "@workspace/ui/components/badge"

import type { InvoiceReminderStatus } from "@/hooks/use-invoice-reminders"

interface ReminderStatusBadgeProps {
  status: InvoiceReminderStatus
}

export function ReminderStatusBadge({ status }: ReminderStatusBadgeProps) {
  switch (status) {
    case "SENT":
      return <Badge variant="secondary">Sent</Badge>

    case "PROCESSING":
      return <Badge variant="secondary">Processing</Badge>

    case "FAILED":
      return <Badge variant="destructive">Failed</Badge>

    case "SCHEDULED":
      return <Badge variant="outline">Scheduled</Badge>
  }
}
