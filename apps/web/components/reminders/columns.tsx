"use client"

import Link from "next/link"
import { createColumnHelper } from "@tanstack/react-table"

import { InvoiceReminder } from "@/hooks/use-invoice-reminders"

import {
  getInvoiceReminderStatus,
  getReminderTypeLabel,
} from "@/lib/invoice-reminders/reminder"

import { ReminderStatusBadge } from "./reminder-status-badge"

import { formatActivityDate } from "@/lib/invoices/invoice"

import { Button } from "@workspace/ui/components/button"

import { AlertCircle, Eye } from "lucide-react"

import { reminderTableFeatures } from "./table-config"

const columnHelper = createColumnHelper<
  typeof reminderTableFeatures,
  InvoiceReminder
>()

export const columns = columnHelper.columns([
  // columnHelper.accessor((row) => row.invoice.customer.name, {
  //   id: "customer",
  //   header: "Customer",

  //   cell: ({ row }) => {
  //     const customer = row.original.invoice.customer

  //     return (
  //       <div className="min-w-0">
  //         <p className="truncate font-medium">{customer.name}</p>

  //         <p className="truncate text-xs text-muted-foreground">
  //           {customer.email}
  //         </p>
  //       </div>
  //     )
  //   },
  // }),

  columnHelper.accessor("invoice.customer.name", {
    id: "customer",
    header: "Customer",

    cell: ({ row }) => {
      const customer = row.original.invoice.customer

      return (
        <div className="min-w-0">
          <p className="truncate font-medium">{customer.name}</p>

          <p className="truncate text-xs text-muted-foreground">
            {customer.email}
          </p>
        </div>
      )
    },
  }),

  columnHelper.accessor("type", {
    header: "Reminder",

    filterFn: "reminderType",

    cell: ({ getValue }) => (
      <span className="text-sm">{getReminderTypeLabel(getValue())}</span>
    ),
  }),

  columnHelper.accessor("scheduledFor", {
    header: "Scheduled",

    cell: ({ getValue }) => (
      <span className="text-sm text-muted-foreground">
        {formatActivityDate(new Date(getValue()).toString())}
      </span>
    ),
  }),

  columnHelper.accessor("sentAt", {
    id: "sentAt",
    header: "Sent",

    cell: ({ getValue }) => {
      const value = getValue()

      if (!value) {
        return <span className="text-sm text-muted-foreground">—</span>
      }

      return (
        <span className="text-sm text-muted-foreground">
          {formatActivityDate(new Date(value).toString())}
        </span>
      )
    },
  }),

  columnHelper.accessor("attempts", {
    header: "Attempts",

    cell: ({ getValue }) => <span className="font-medium">{getValue()}</span>,
  }),

  columnHelper.display({
    id: "status",
    header: "Status",

    cell: ({ row }) => {
      const status = getInvoiceReminderStatus(row.original)

      return <ReminderStatusBadge status={status} />
    },
  }),

  columnHelper.display({
    id: "error",
    header: "Last error",

    enableSorting: false,

    cell: ({ row }) => {
      const error = row.original.lastError

      if (!error) {
        return <span className="text-sm text-muted-foreground">—</span>
      }

      return (
        <div className="flex max-w-60 items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />

          <span className="truncate text-sm text-destructive" title={error}>
            {error}
          </span>
        </div>
      )
    },
  }),

  columnHelper.display({
    id: "actions",

    enableSorting: false,
    enableHiding: false,

    cell: ({ row }) => {
      const reminder = row.original

      return (
        <Button
          nativeButton={false}
          variant="ghost"
          size="icon"
          title="View reminder"
          render={<Link href={`/dashboard/reminders/${reminder.id}`} />}
        >
          <Eye className="h-4 w-4" />
          <span className="sr-only">View reminder</span>
        </Button>
      )
    },
  }),
])
