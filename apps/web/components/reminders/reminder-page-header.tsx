"use client"

import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

export function ReminderPageHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Invoice reminders</h1>

        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          Manage scheduled reminders and track their delivery status.
        </p>
      </div>

      <Button
        nativeButton={false}
        className="w-full sm:w-auto"
        render={<Link href="/dashboard/settings/reminders" />}
      >
        <Plus className="mr-2 h-4 w-4" />
        Reminder settings
      </Button>
    </div>
  )
}
