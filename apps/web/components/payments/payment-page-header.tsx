"use client"

import { motion } from "motion/react"

export function PaymentPageHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payments</h1>

        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          Track payments received from your customers.
        </p>
      </div>
    </motion.div>
  )
}