"use client"

import Link from "next/link"

import { ArrowLeft } from "lucide-react"

import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge"
import { InvoiceSummary } from "@/components/invoices/invoice-summary"
import { InvoiceItems } from "@/components/invoices/invoice-item"
import { InvoicePayment } from "@/components/invoices/invoice-payment"
import { InvoiceActions } from "@/components/invoices/invoice-actions"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Invoice } from "@/components/invoices/invoice-data"
import {
  getEffectiveInvoiceStatus,
  getInvoices,
  INVOICE_STORAGE_EVENT,
} from "@/components/invoices/invoice-storage"
import { formatActivityDate } from "@/lib/invoice/invoice"

export default function InvoiceDetailsPage() {
  const params = useParams<{ id: string }>()
  const [invoice, setInvoice] = useState<Invoice | null>(null)

  const effectiveStatus = invoice ? getEffectiveInvoiceStatus(invoice) : null

  const isPaid = effectiveStatus === "Paid"
  // const isCancelled = effectiveStatus === "Cancelled"
  const isSent = effectiveStatus === "Sent"

  useEffect(() => {
    const loadInvoice = () => {
      const storedInvoices = getInvoices()

      const foundInvoice = storedInvoices.find(
        (invoice) => invoice.id === params.id
      )

      setInvoice(foundInvoice ?? null)
    }

    loadInvoice()

    window.addEventListener(INVOICE_STORAGE_EVENT, loadInvoice)

    return () => {
      window.removeEventListener(INVOICE_STORAGE_EVENT, loadInvoice)
    }
  }, [params.id])

  if (!invoice) {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <Link
          href="/dashboard/invoices"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to invoices
        </Link>

        <h1 className="text-2xl font-semibold">Invoice not found</h1>
      </div>
    )
  }

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
            <h1 className="text-2xl font-semibold tracking-tight">
              {invoice.id}
            </h1>

            <InvoiceStatusBadge status={effectiveStatus ?? "Draft"} />
          </div>

          <p className="text-sm text-muted-foreground">
            Issued {invoice.issueDate} · Due {invoice.dueDate}
          </p>
        </div>

        <InvoiceActions invoice={invoice} />
      </div>

      <InvoiceSummary invoice={invoice} />
      <InvoiceItems invoice={invoice} />
      {effectiveStatus === "Cancelled" ? (
        <InvoiceCancellation invoice={invoice} />
      ) : (
        <>
          {(isPaid ||
            effectiveStatus === "Sent" ||
            effectiveStatus === "Overdue") && (
            <InvoicePayment invoice={invoice} />
          )}
        </>
      )}
    </div>
  )
}

function InvoiceCancellation({ invoice }: { invoice: Invoice }) {
  return (
    <div className="rounded-2xl border bg-background p-6">
      <div className="mb-5">
        <h2 className="font-semibold">Invoice cancelled</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          This invoice is no longer active.
        </p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">Cancelled on</p>

          {invoice.cancelledAt && (
            <p className="text-sm text-muted-foreground">
              {formatActivityDate(invoice.cancelledAt)}
            </p>
          )}
        </div>

        <InvoiceStatusBadge status="Cancelled" />
      </div>
    </div>
  )
}
