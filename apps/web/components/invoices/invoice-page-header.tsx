"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { motion } from "motion/react"

import { Button } from "@workspace/ui/components/button"

export function InvoicePageHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>

        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          Create, manage and track all your invoices.
        </p>
      </div>

      <Button className="w-full bg-[#2EAFB4] text-white hover:bg-[#26969a] sm:w-auto">
        <Link href="/dashboard/invoices/new" className="flex">
          <Plus className="mr-2 h-4 w-4" />
          <span className="flex items-center leading-0">Create invoice</span>
        </Link>
      </Button>
    </motion.div>
  )
}
