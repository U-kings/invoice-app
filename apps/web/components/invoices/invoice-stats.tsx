"use client"

import { motion } from "motion/react"
import { CircleDollarSign, Clock3, FileText, TriangleAlert } from "lucide-react"

import type { Invoice, InvoiceStatus } from "./invoice-data"
import { getEffectiveInvoiceStatus } from "./invoice-storage"
import { BsCash } from "react-icons/bs"
import { formatCurrency } from "@/lib/currency"
import { getInvoiceTotal } from "@/lib/invoice/invoice"

interface InvoiceStatsProps {
  invoices: Invoice[]
}

interface CurrencyTotal {
  currency: string
  amount: number
}

function groupByCurrency(
  invoices: Invoice[],
  statuses: InvoiceStatus[]
): CurrencyTotal[] {
  const totals: Record<string, number> = {}

  invoices.forEach((invoice) => {
    const status = getEffectiveInvoiceStatus(invoice)

    if (!statuses.includes(status)) {
      return
    }

    const total = getInvoiceTotal(invoice)

    totals[invoice.currency] = (totals[invoice.currency] ?? 0) + total
  })

  return Object.entries(totals).map(([currency, amount]) => ({
    currency,
    amount,
  }))
}

export function InvoiceStats({ invoices }: InvoiceStatsProps) {
  const totals = invoices.reduce(
    (acc, invoice) => {
      const status = getEffectiveInvoiceStatus(invoice)
      const total = getInvoiceTotal(invoice)

      acc.totalInvoices += 1

      if (status === "Paid") {
        acc.paid += total
      }

      // if (status === "Sent" || status === "Draft" || status === "Pending") {
      // acc.pending += total
      if (status === "Sent") {
        acc.pending += total
      }

      if (status === "Overdue") {
        acc.overdue += total
      }

      return acc
    },
    {
      totalInvoices: 0,
      paid: 0,
      pending: 0,
      overdue: 0,
    }
  )

  const paidTotals = groupByCurrency(invoices, ["Paid"])

  const pendingTotals = groupByCurrency(invoices, ["Sent"])
  // const pendingTotals = groupByCurrency(invoices, ["Draft", "Sent", "Pending"])

  const overdueTotals = groupByCurrency(invoices, ["Overdue"])

  const stats = [
    {
      type: "count" as const,
      title: "Total invoices",
      value: totals.totalInvoices.toString(),
      description: "All invoices",
      icon: FileText,
    },
    {
      type: "currency" as const,
      title: "Paid",
      value: paidTotals,
      description: "Collected",
      icon: BsCash,
    },
    {
      type: "currency" as const,
      title: "Pending",
      value: pendingTotals,
      // value: formatCurrency(totals.pending, invoices[0]?.currency ?? "NGN"),
      description: "Awaiting payment",
      icon: Clock3,
    },
    {
      type: "currency" as const,
      title: "Overdue",
      value: overdueTotals,
      description: "Needs attention",
      icon: TriangleAlert,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon

        return (
          <motion.div
            key={stat.title}
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.3,
              delay: index * 0.05,
            }}
            className="rounded-2xl border bg-background p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>

                <div className="mt-2 space-y-1">
                  {stat.type === "count" ? (
                    <p className="text-2xl font-bold tracking-tight">
                      {stat.value}
                    </p>
                  ) : stat.value.length > 0 ? (
                    <>
                      {stat.value.slice(0, 2).map((value) => (
                        <p
                          key={value.currency}
                          className="truncate text-2xl font-bold tracking-tight"
                        >
                          {formatCurrency(value.amount, value.currency)}
                        </p>
                      ))}

                      {stat.value.length > 2 && (
                        <p className="text-xs text-muted-foreground">
                          +{stat.value.length - 2} more currencies
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-2xl font-bold tracking-tight">—</p>
                  )}
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </div>

              <div className="rounded-xl bg-[#2EAFB4]/10 p-2.5">
                <Icon className="h-5 w-5 text-[#2EAFB4]" />
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
