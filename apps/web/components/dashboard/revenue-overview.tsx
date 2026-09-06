"use client"

import { useState } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { motion } from "motion/react"

import { useDashboard } from "@/hooks/use-dashboard"
import { PeriodSelect } from "./period-select"
import { getCurrencySymbol } from "@/lib/currency"

type RevenuePeriod = "month" | "6months" | "year"

const periodOptions = [
  {
    value: "year",
    label: "This Year",
  },
  {
    value: "6months",
    label: "Last 6 Months",
  },
  {
    value: "month",
    label: "This Month",
  },
] as const

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

function formatCompactCurrency(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      // currency,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value)
  } catch {
    // return `${currency} ${value.toLocaleString()}`
    return `${value.toLocaleString()}`
  }
}

export function RevenueOverview() {
  const [period, setPeriod] = useState<RevenuePeriod>("6months")

  const { data, isLoading, isFetching } = useDashboard(undefined, period)

  if (isLoading || !data) {
    return (
      <div className="rounded-3xl border bg-background/80 p-6 shadow-sm backdrop-blur-xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="h-6 w-40 animate-pulse rounded-lg bg-muted" />
            <div className="h-4 w-56 animate-pulse rounded-lg bg-muted" />
          </div>

          <div className="h-10 w-32 animate-pulse rounded-xl bg-muted" />
        </div>

        <div className="mb-8 space-y-3">
          <div className="h-10 w-48 animate-pulse rounded-lg bg-muted" />
          <div className="h-4 w-36 animate-pulse rounded-lg bg-muted" />
        </div>

        <div className="h-80 animate-pulse rounded-2xl bg-muted/40" />
      </div>
    )
  }

  const revenueData = data.revenue.data

  const totalRevenue = revenueData.reduce(
    (total, item) => total + item.revenue,
    0
  )

  const currentRevenue = revenueData[revenueData.length - 1]?.revenue ?? 0

  const previousRevenue = revenueData[revenueData.length - 2]?.revenue ?? 0

  const revenueChange =
    previousRevenue === 0
      ? currentRevenue > 0
        ? 100
        : 0
      : ((currentRevenue - previousRevenue) / previousRevenue) * 100

  const isPositive = revenueChange >= 0

  const periodLabel =
    periodOptions.find((option) => option.value === period)?.label ??
    "Last 6 Months"

  const subtitle =
    period === "month"
      ? "Daily revenue for the current month."
      : period === "year"
        ? "Monthly revenue for the current year."
        : "Monthly revenue over the last 6 months."

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 25,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
      }}
      transition={{
        duration: 0.5,
      }}
      className="rounded-3xl border bg-background/80 p-6 shadow-sm backdrop-blur-xl"
    >
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Revenue Overview</h2>

          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <PeriodSelect
          period={period}
          setPeriod={setPeriod}
          periodOptions={periodOptions}
          isFetching={isFetching}
        />

        {/* <select
          value={period}
          onChange={(event) => setPeriod(event.target.value as RevenuePeriod)}
          disabled={isFetching}
          aria-label="Revenue period"
          className="h-10 rounded-xl border bg-background px-4 text-sm font-medium transition-colors outline-none hover:bg-muted/50 focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {periodOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select> */}
      </div>

      <div className="mb-8">
        <h3 className="text-4xl font-bold tracking-tight">
          {formatCurrency(totalRevenue, data.currency)}
        </h3>

        <div className="mt-2 flex items-center gap-2 text-sm">
          <span
            className={
              isPositive
                ? "font-medium text-green-500"
                : "font-medium text-red-500"
            }
          >
            {isPositive ? "+" : ""}
            {revenueChange.toFixed(1)}%
          </span>

          <span className="text-muted-foreground">
            {periodLabel === "This Month"
              ? "vs previous day"
              : "vs previous month"}
          </span>
        </div>
      </div>

      <div
        className={
          isFetching
            ? "h-80 opacity-60 transition-opacity"
            : "h-80 transition-opacity"
        }
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={revenueData}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 5,
            }}
          >
            <defs>
              <linearGradient id="revenue-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2EAFB4" stopOpacity={0.35} />

                <stop offset="100%" stopColor="#2EAFB4" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={false}
              strokeDasharray="4 4"
              className="stroke-border/50"
            />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tickMargin={12}
              minTickGap={24}
              className="text-xs"
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              width={30}
              tickFormatter={(value) =>
                formatCompactCurrency(Number(value), data.currency)
              }
              className="text-xs"
            />

            <Tooltip
              formatter={(value) => [
                formatCurrency(Number(value), data.currency),
                "Revenue",
              ]}
              contentStyle={{
                borderRadius: "16px",
                border: "1px solid hsl(var(--border))",
                backgroundColor: "hsl(var(--background))",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
              }}
            />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#2EAFB4"
              strokeWidth={3}
              fill="url(#revenue-gradient)"
              fillOpacity={1}
              activeDot={{
                r: 5,
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
