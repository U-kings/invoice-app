"use client"

import { useDashboard } from "@/hooks/use-dashboard"
import { motion } from "motion/react"
import { MoreHorizontal } from "lucide-react"
import Link from "next/link"

import { InvoiceStatusBadge } from "./invoice-status-badge"
import { getInvoiceTotal } from "@/lib/invoices/invoice"
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

function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
  }).format(new Date(date))
}

export function RecentInvoices() {
  const { data, isLoading, isError } = useDashboard()

  const invoices = data?.recentInvoices ?? []

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="h-full rounded-3xl border bg-background/80 p-6 shadow-sm backdrop-blur-xl"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Recent Invoices</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Your latest invoices
          </p>
        </div>

        <Link
          href="/dashboard/invoices"
          className="text-sm font-medium text-[#2EAFB4] transition-opacity hover:opacity-80"
        >
          View All
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-2xl border p-4"
            >
              <div className="space-y-2">
                <div className="h-5 w-24 animate-pulse rounded-md bg-muted" />
                <div className="h-4 w-32 animate-pulse rounded-md bg-muted" />
              </div>

              <div className="hidden space-y-2 md:block">
                <div className="ml-auto h-5 w-20 animate-pulse rounded-md bg-muted" />
                <div className="ml-auto h-4 w-16 animate-pulse rounded-md bg-muted" />
              </div>

              <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex min-h-56 items-center justify-center text-sm text-muted-foreground">
          Unable to load recent invoices.
        </div>
      ) : invoices.length === 0 ? (
        <div className="flex min-h-56 flex-col items-center justify-center text-center">
          <p className="font-medium">No invoices yet</p>

          <p className="mt-1 text-sm text-muted-foreground">
            Your recent invoices will appear here.
          </p>

          <Link
            href="/dashboard/invoices/create"
            className="mt-4 text-sm font-medium text-[#2EAFB4] hover:underline"
          >
            Create your first invoice
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {invoices.map((invoice) => {
            const total = getInvoiceTotal(invoice)

            return (
              <Link
                key={invoice.id}
                href={`/dashboard/invoices/${invoice.id}`}
                className="block"
              >
                <div className="flex items-center justify-between rounded-2xl border p-4 transition hover:bg-muted/40">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">
                      {invoice.invoiceNumber}
                    </p>

                    <p className="truncate text-sm text-muted-foreground">
                      {invoice.customer.name}
                    </p>
                  </div>

                  <div className="hidden shrink-0 text-right md:block">
                    <p>{formatCurrency(total, invoice.currency)}</p>

                    <p className="text-sm text-muted-foreground">
                      {formatDate(invoice.createdAt)}
                    </p>
                  </div>

                  <InvoiceStatusBadge status={invoice.status} />

                  <MoreHorizontal
                    size={18}
                    className="shrink-0 text-muted-foreground"
                  />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
