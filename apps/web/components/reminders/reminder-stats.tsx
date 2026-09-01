"use client"

import { CalendarClock, CheckCircle2, CircleAlert, Clock3 } from "lucide-react"

import type { InvoiceReminderStats } from "@/hooks/use-invoice-reminders"

interface ReminderStatsProps {
  stats?: InvoiceReminderStats
  isLoading?: boolean
}

export function ReminderStats({
  stats,
  isLoading = false,
}: ReminderStatsProps) {
  const items = [
    {
      label: "Scheduled",
      value: stats?.scheduled ?? 0,
      icon: CalendarClock,
    },
    {
      label: "Processing",
      value: stats?.processing ?? 0,
      icon: Clock3,
    },
    {
      label: "Sent",
      value: stats?.sent ?? 0,
      icon: CheckCircle2,
    },
    {
      label: "Failed",
      value: stats?.failed ?? 0,
      icon: CircleAlert,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon

        return (
          <div
            key={item.label}
            className="rounded-2xl border bg-background p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{item.label}</p>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="mt-3">
              <p className="text-2xl font-semibold tracking-tight">
                {isLoading ? "—" : item.value}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
