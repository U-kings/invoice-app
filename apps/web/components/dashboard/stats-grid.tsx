"use client"

import { useEffect, useState } from "react"
import { CreditCard, FileText, Users, Wallet } from "lucide-react"

import { useDashboard } from "@/hooks/use-dashboard"

import { StatCard } from "./stat-card"

export function StatsGrid() {
  const [selectedCurrency, setSelectedCurrency] = useState<string | undefined>(
    undefined
  )

  const { data, isLoading, isFetching } = useDashboard(selectedCurrency)

  const activeCurrency = selectedCurrency ?? data?.currency

  if (isLoading || !data) {
    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-40 animate-pulse rounded-lg bg-muted" />

          <div className="h-10 w-32 animate-pulse rounded-xl bg-muted" />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-55 animate-pulse rounded-3xl border bg-muted/40"
            />
          ))}
        </div>
      </section>
    )
  }

  const currency = activeCurrency ?? data.currency

  const stats = [
    {
      title: "Total Revenue",
      value: data.stats.totalRevenue,
      change: data.stats.revenueChange,
      color: "#2EAFB4",
      icon: Wallet,
      data: data.revenue.data.map((item) => item.revenue),
      type: "currency" as const,
    },
    {
      title: "Invoices",
      value: data.stats.totalInvoices,
      change: data.stats.invoiceChange,
      color: "#3B82F6",
      icon: FileText,
      data: data.invoiceTrend.data.map((item) => item.count),
      type: "number" as const,
    },
    {
      title: "Customers",
      value: data.stats.totalCustomers,
      change: data.stats.customerChange,
      color: "#F59E0B",
      icon: Users,
      data: data.customerTrend.data.map((item) => item.count),
      type: "number" as const,
    },
    {
      title: "Outstanding",
      value: data.stats.outstanding,
      change: undefined,
      color: "#EF4444",
      icon: CreditCard,
      data: data.outstandingTrend.data.map((item) => item.amount),
      type: "currency" as const,
    },
  ]

  return (
    <section className="space-y-6">
      {/* Header / Currency selector */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Overview</h2>

          <p className="text-sm text-muted-foreground">
            Track your business performance at a glance.
          </p>
        </div>

        {data.availableCurrencies.length > 1 && (
          <div className="relative">
            <select
              value={currency}
              onChange={(event) => setSelectedCurrency(event.target.value)}
              disabled={isFetching}
              aria-label="Select dashboard currency"
              className="h-10 min-w-32 appearance-none rounded-xl border bg-background px-4 pr-10 text-sm font-medium shadow-sm transition-colors outline-none hover:bg-muted/50 focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {data.availableCurrencies.map((availableCurrency) => (
                <option key={availableCurrency} value={availableCurrency}>
                  {availableCurrency}
                </option>
              ))}
            </select>

            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Stats */}
      <div
        className={
          isFetching
            ? "grid gap-6 opacity-60 transition-opacity sm:grid-cols-2 xl:grid-cols-4"
            : "grid gap-6 transition-opacity sm:grid-cols-2 xl:grid-cols-4"
        }
      >
        {stats.map((stat) => (
          <StatCard key={stat.title} stat={stat} currency={currency} />
        ))}
      </div>
    </section>
  )
}
