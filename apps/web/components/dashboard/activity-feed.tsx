"use client"

import { motion } from "motion/react"

const activities = [
  {
    title: "Invoice INV-1021 paid",
    time: "2 min ago",
  },
  {
    title: "New customer added",
    time: "12 min ago",
  },
  {
    title: "Payment received",
    time: "35 min ago",
  },
  {
    title: "Invoice sent",
    time: "1 hour ago",
  },
  {
    title: "Invoice sent",
    time: "2 hour ago",
  },
]

export function ActivityFeed() {
  return (
    <div className="h-full rounded-3xl border bg-background/80 p-6 shadow-sm backdrop-blur-xl">
      <h2 className="mb-6 text-xl font-semibold">Activity</h2>

      <div className="space-y-5">
        {activities.map((activity, index) => (
          <motion.div
            key={++index}
            initial={{
              opacity: 0,
              x: 20,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              delay: index * 0.1,
            }}
            className="flex gap-4"
          >
            <div className="mt-2 h-3 w-3 rounded-full bg-[#2EAFB4]" />

            <div>
              <p className="font-medium">{activity.title}</p>

              <p className="text-sm text-muted-foreground">{activity.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
