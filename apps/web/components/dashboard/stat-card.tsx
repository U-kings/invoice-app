"use client"

import { motion } from "motion/react"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"

import { MiniChart } from "./mini-chart"
import { StatCounter } from "./stat-counter"
import { getCurrencySymbol } from "@/lib/currency"

interface Stat {
  title: string
  value: number
  change?: number
  color: string
  icon: React.ElementType
  data: number[]
  type: "currency" | "number"
}

interface Props {
  stat: Stat
  currency: string
}

// function getCurrencySymbol(currency: string) {
//   // const currencySymbol = getCurrencySymbol(currency)
//   try {
//     return (
//       new Intl.NumberFormat("en", {
//         style: "currency",
//         currency: "N",
//       })
//         .formatToParts(0)
//         .find((part) => part.type === "currency")?.value ?? currency
//     )
//   } catch {
//     return currency
//   }
// }

export function StatCard({ stat, currency }: Props) {
  const Icon = stat.icon

  const currencySymbol =
    stat.type === "currency" ? getCurrencySymbol(currency) : undefined

  const hasChange = typeof stat.change === "number"

  const isPositive = (stat.change ?? 0) >= 0

  return (
    <motion.div
      whileHover={{
        y: -6,
        scale: 1.02,
      }}
      transition={{
        duration: 0.25,
      }}
      className="group flex flex-col justify-between rounded-3xl border bg-background/80 p-6 shadow-sm backdrop-blur-xl"
    >
      <div className="mb-5 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{stat.title}</p>

          <h3 className="mt-1 text-3xl font-bold tracking-tight wrap-break-word">
            <StatCounter
              value={stat.value}
              prefix={stat.type === "currency" ? currencySymbol : undefined}
              decimals={stat.type === "currency" ? 2 : 0}
            />
          </h3>

          {stat.type === "currency" && (
            <p className="mt-1 text-xs text-muted-foreground">{currency}</p>
          )}
        </div>

        <div
          className="shrink-0 rounded-2xl p-4"
          style={{
            backgroundColor: `${stat.color}20`,
          }}
        >
          <Icon
            size={26}
            style={{
              color: stat.color,
            }}
          />
        </div>
      </div>

      {stat.data.length > 1 && (
        <div className="mt-auto">
          <MiniChart color={stat.color} data={stat.data} />
        </div>
      )}

      {hasChange && (
        <div className="mt-5 flex items-center gap-2">
          {isPositive ? (
            <ArrowUpRight className="text-green-500" size={18} />
          ) : (
            <ArrowDownRight className="text-red-500" size={18} />
          )}

          <span className={isPositive ? "text-green-500" : "text-red-500"}>
            {isPositive ? "+" : ""}
            {stat.change!.toFixed(1)}%
          </span>

          <span className="text-sm text-muted-foreground">vs last month</span>
        </div>
      )}

      {!hasChange && stat.title === "Outstanding" && (
        <div className="mt-5 text-sm text-muted-foreground">
          {/* Current outstanding balance */}
          Outstanding by due month
        </div>
      )}
    </motion.div>
  )
}
