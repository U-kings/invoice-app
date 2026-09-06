"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { CalendarDays } from "lucide-react"

import { useDashboard } from "@/hooks/use-dashboard"
import { getCurrencySymbol } from "@/lib/currency"

function formatCurrency(value: number, currency: string) {
  const currencySymbol = getCurrencySymbol(currency)
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: currencySymbol,
      maximumFractionDigits: 2,
    }).format(value)
  } catch {
    return `${currencySymbol} ${value.toLocaleString()}`
  }
}

function formatDueDate(date: string) {
  const dueDate = new Date(date)

  if (Number.isNaN(dueDate.getTime())) {
    return "Unknown"
  }

  const today = new Date()

  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  )

  const startOfDueDate = new Date(
    dueDate.getFullYear(),
    dueDate.getMonth(),
    dueDate.getDate()
  )

  const diffInDays = Math.round(
    (startOfDueDate.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (diffInDays === 0) {
    return "Today"
  }

  if (diffInDays === 1) {
    return "Tomorrow"
  }

  if (diffInDays > 1 && diffInDays < 7) {
    return `In ${diffInDays} days`
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(dueDate)
}

export function UpcomingInvoices() {
  const { data, isLoading, isError } = useDashboard()

  const upcomingInvoices = data?.upcomingInvoices ?? []

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="rounded-3xl border bg-background/80 p-6 shadow-sm backdrop-blur-xl"
    >
      <div className="mb-6 flex items-center gap-3">
        <CalendarDays className="text-[#2EAFB4]" />

        <h2 className="text-xl font-semibold">Upcoming Invoices</h2>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-2xl border p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="h-5 w-32 animate-pulse rounded-md bg-muted" />
                <div className="h-5 w-24 animate-pulse rounded-md bg-muted" />
              </div>

              <div className="mt-3 h-4 w-20 animate-pulse rounded-md bg-muted" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive">
            Failed to load upcoming invoices.
          </p>
        </div>
      ) : upcomingInvoices.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-6 text-center">
          <CalendarDays className="mx-auto mb-3 size-8 text-muted-foreground" />

          <p className="font-medium">No upcoming invoices</p>

          <p className="mt-1 text-sm text-muted-foreground">
            You don&apos;t have any sent invoices coming due.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {upcomingInvoices.map((invoice) => (
            <Link
              key={invoice.id}
              href={`/dashboard/invoices/${invoice.id}`}
              className="block"
            >
              <div className="rounded-2xl border p-4 transition hover:border-[#2EAFB4]/40 hover:bg-muted/30">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {invoice.customer.name}
                    </p>

                    {/* <p className="mt-1 text-xs text-muted-foreground">
                      {invoice.invoiceNumber}
                    </p> */}
                  </div>

                  <p className="shrink-0 font-semibold">
                    {formatCurrency(invoice.total, invoice.currency)}
                  </p>
                </div>

                <p className="mt-2 text-sm text-muted-foreground">
                  Due {formatDueDate(invoice.dueDate)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </motion.div>
  )
}
