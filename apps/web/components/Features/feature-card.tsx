"use client"

import { motion } from "motion/react"
import { ArrowRight } from "lucide-react"
import { LucideIcon } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

interface FeatureCardProps {
  title: string
  description: string
  icon: LucideIcon
  color?: "teal" | "blue"
}

export function FeatureCard({
  title,
  description,
  icon: Icon,
  color = "teal",
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      whileHover={{
        y: -8,
      }}
      transition={{
        duration: 0.35,
      }}
      className={cn(
        "group relative overflow-hidden rounded-3xl",
        "border border-border/60",
        "bg-card/60 backdrop-blur-xl",
        "p-7 transition-all",
        "hover:border-[#2EAFB4]/40",
        "hover:shadow-[0_20px_60px_rgba(46,175,180,.15)]"
      )}
    >
      {/* Glow */}

      <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-[#2EAFB4]/5 blur-3xl" />

      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-2xl",

            color === "teal"
              ? "bg-gradient-to-br from-[#2EAFB4] to-cyan-400"
              : "bg-gradient-to-br from-indigo-500 to-blue-500"
          )}
        >
          <Icon className="h-8 w-8 text-white" />
        </div>

        <motion.div
          whileHover={{
            x: 5,
          }}
          className="flex h-10 w-10 items-center justify-center rounded-full border"
        >
          <ArrowRight className="h-4 w-4" />
        </motion.div>
      </div>

      <h3 className="mt-8 text-2xl font-semibold">{title}</h3>

      <p className="mt-4 leading-8 text-muted-foreground">{description}</p>
    </motion.div>
  )
}
