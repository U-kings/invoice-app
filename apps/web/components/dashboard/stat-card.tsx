"use client"

import { motion } from "motion/react"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

import { MiniChart } from "./mini-chart"
import { StatCounter } from "./stat-counter"

interface Props {
  stat: {
    title: string
    value: string
    change: string
    positive: boolean
    color: string
    icon: React.ElementType
    data: number[]
  }
}

export function StatCard({ stat }: Props) {
  const Icon = stat.icon

  return (
    <motion.div
      whileHover={{
        y: -6,
        scale: 1.02,
      }}
      transition={{
        duration: 0.25,
      }}
      className="group rounded-3xl border bg-background/80 p-6 shadow-sm backdrop-blur-xl"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{stat.title}</p>

          <h3 className="text-3xl font-bold">
            <StatCounter value={88455} prefix="$" decimals={2} />
          </h3>
        </div>

        <div
          className="rounded-2xl p-4"
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

      <div className="mt-5">
        <MiniChart color={stat.color} data={stat.data} />
      </div>

      <div className="mt-5 flex items-center gap-2">
        {stat.positive ? (
          <ArrowUpRight className="text-green-500" size={18} />
        ) : (
          <ArrowDownRight className="text-red-500" size={18} />
        )}

        <span className={stat.positive ? "text-green-500" : "text-red-500"}>
          {stat.change}
        </span>

        <span className="text-sm text-muted-foreground">vs last month</span>
      </div>
    </motion.div>
  )
}
