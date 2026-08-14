import Link from "next/link"

import { ArrowLeft } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge"
import { InvoiceSummary } from "@/components/invoices/invoice-summary"
import { InvoiceItems } from "@/components/invoices/invoice-item"
import { InvoicePayment } from "@/components/invoices/invoice-payment"
import { InvoiceActions } from "@/components/invoices/invoice-actions"

export default async function InvoiceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Back */}
      <Link
        href="/dashboard/invoices"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to invoices
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{id}</h1>

            <InvoiceStatusBadge status="Paid" />
          </div>

          <p className="text-sm text-muted-foreground">
            Issued Aug 10, 2026 · Due Aug 20, 2026
          </p>
        </div>

        <InvoiceActions invoiceId={id} status="Paid" />
      </div>

      <InvoiceSummary />
      <InvoiceItems />
      <InvoicePayment />
    </div>
  )
}
