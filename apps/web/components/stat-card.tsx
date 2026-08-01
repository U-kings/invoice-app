"use client"

import { motion } from "motion/react"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string
  subtitle: string
  icon: LucideIcon
  accent?: boolean
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent,
}: StatCardProps) {
  return (
    <motion.div
      whileHover={{
        y: -8,
        scale: 1.03,
      }}
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.2,
      }}
      className="rounded-2xl border border-border/60 bg-background/40 p-5 backdrop-blur-xl"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>

          <h3 className="mt-3 text-3xl font-bold">{value}</h3>

          <p
            className={`mt-2 text-sm ${
              accent ? "text-[#2EAFB4]" : "text-muted-foreground"
            }`}
          >
            {subtitle}
          </p>
        </div>

        <div
          className={`rounded-xl p-3 ${
            accent ? "bg-[#2EAFB4]/15 text-[#2EAFB4]" : "bg-muted"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  )
}
