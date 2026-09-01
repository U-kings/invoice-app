"use client"

import { motion } from "motion/react"
import { Clock3, TriangleAlert } from "lucide-react"
import { BsCash } from "react-icons/bs"
import { formatCurrency } from "@/lib/currency"
import { PaymentListItem } from "@/hooks/use-payment"

interface PaymentStatsProps {
  payments: PaymentListItem[] | undefined
}

interface CurrencyTotal {
  currency: string
  amount: number
}

function groupByCurrency(
  payments: PaymentListItem[] | undefined,
  status: string
): CurrencyTotal[] {
  const totals: Record<string, number> = {}

  payments?.forEach((payment) => {
    if (payment.status.toLowerCase() !== status.toLowerCase()) {
      return
    }

    const amount = Number(payment.amount) || 0
    const currency = payment.currency || "NGN"

    totals[currency] = (totals[currency] ?? 0) + amount
  })

  return Object.entries(totals).map(([currency, amount]) => ({
    currency,
    amount,
  }))
}

export function PaymentStats({ payments }: PaymentStatsProps) {
  const paidTotals = groupByCurrency(payments, "Paid")
  const pendingTotals = groupByCurrency(payments, "Pending")
  const failedTotals = groupByCurrency(payments, "Failed")

  // Optional calculation for payment count descriptors
  const pendingCount = payments?.filter((p) => p.status.toLowerCase() === "pending").length ?? 0
  const failedCount = payments?.filter((p) => p.status.toLowerCase() === "failed").length ?? 0

  const stats = [
    {
      type: "currency" as const,
      title: "Total received",
      value: paidTotals,
      description: "Collected payments",
      icon: BsCash,
    },
    {
      type: "currency" as const,
      title: "Pending",
      value: pendingTotals,
      description: `${pendingCount} payment${pendingCount === 1 ? "" : "s"} awaiting processing`,
      icon: Clock3,
    },
    {
      type: "currency" as const,
      title: "Failed",
      value: failedTotals,
      description: `${failedCount} payment${failedCount === 1 ? "" : "s"} need attention`,
      icon: TriangleAlert,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {stats.map((stat, index) => {
        const Icon = stat.icon

        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="rounded-2xl border bg-background p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>

                <div className="mt-2 space-y-1">
                  {stat.value.length > 0 ? (
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