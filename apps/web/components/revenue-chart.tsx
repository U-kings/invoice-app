"use client"

import { motion } from "motion/react"

const points = [
  [0, 180],
  [60, 150],
  [120, 160],
  [180, 110],
  [240, 130],
  [300, 70],
  [360, 95],
  [420, 40],
]

const path = points
  .map((point, index) => `${index === 0 ? "M" : "L"} ${point[0]} ${point[1]}`)
  .join(" ")

export function RevenueChart() {
  return (
    <div className="relative h-[320px] w-full overflow-hidden rounded-2xl">
      {/* background grid */}

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 420 220"
        preserveAspectRatio="none"
      >
        <motion.path
          d={`${path} L420 220 L0 220 Z`}
          fill="url(#fill)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        />
        {[40, 80, 120, 160, 200].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="420"
            y2={y}
            stroke="currentColor"
            className="text-border/40"
            strokeDasharray="6 8"
          />
        ))}

        {[60, 120, 180, 240, 300, 360].map((x) => (
          <line
            key={x}
            x1={x}
            y1="0"
            x2={x}
            y2="220"
            stroke="currentColor"
            className="text-border/30"
            strokeDasharray="6 8"
          />
        ))}
      </svg>

      {/* chart */}

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 420 220">
        <defs>
          <linearGradient id="fill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2EAFB4" stopOpacity=".35" />
            <stop offset="100%" stopColor="#2EAFB4" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="line" x1="0%" x2="100%">
            <stop offset="0%" stopColor="#2EAFB4" />
            <stop offset="100%" stopColor="#56E1E5" />
          </linearGradient>
        </defs>

        <motion.path
          d={path}
          fill="none"
          stroke="url(#line)"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{
            pathLength: 0,
          }}
          animate={{
            pathLength: 1,
          }}
          transition={{
            duration: 2,
            ease: "easeOut",
          }}
        />

        {points.map(([x, y], index) => (
          <motion.circle
            key={index}
            cx={x}
            cy={y}
            r="5"
            fill="#2EAFB4"
            initial={{
              scale: 0,
            }}
            animate={{
              scale: 1,
            }}
            transition={{
              delay: index * 0.15,
            }}
          />
        ))}
      </svg>

      {/* labels */}

      <div className="absolute bottom-0 flex w-full justify-between px-3 pb-2 text-xs text-muted-foreground">
        <span>Jan</span>
        <span>Feb</span>
        <span>Mar</span>
        <span>Apr</span>
        <span>May</span>
        <span>Jun</span>
        <span>Jul</span>
      </div>
    </div>
  )
}
