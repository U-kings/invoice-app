"use client"

import Link from "next/link"
import { ArrowRight, FilePlus2 } from "lucide-react"
import { motion } from "motion/react"

import { Button } from "@workspace/ui/components/button"

export function CreateInvoiceBanner() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative overflow-hidden rounded-3xl border bg-[#2EAFB4]/5 p-6 sm:p-7"
    >
      {/* Decorative background */}
      <div className="pointer-events-none absolute -top-20 -right-16 h-48 w-48 rounded-full bg-[#2EAFB4]/10 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-[#2EAFB4]/10 blur-3xl" />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#2EAFB4] text-white shadow-sm">
            <FilePlus2 className="h-6 w-6" />
          </div>

          <div>
            <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
              Create a new invoice
            </h2>

            <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
              Send a professional invoice to your customer and start tracking
              payments in one place.
            </p>
          </div>
        </div>

        <Button className="group flex w-full shrink-0 bg-[#2EAFB4] text-white hover:bg-[#26969a] sm:w-auto">
          <Link href="/dashboard/invoices/new" className="flex">
            <span className="flex items-center leading-0">Create invoice</span>
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </motion.section>
  )
}
