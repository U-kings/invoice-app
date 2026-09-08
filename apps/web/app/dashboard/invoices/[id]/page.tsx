"use client"

import Link from "next/link"

import { ArrowLeft } from "lucide-react"

import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge"
import { InvoiceSummary } from "@/components/invoices/invoice-summary"
import { InvoiceItems } from "@/components/invoices/invoice-item"
import { InvoicePayment } from "@/components/invoices/invoice-payment"
import { InvoiceActions } from "@/components/invoices/invoice-actions"
import { useParams } from "next/navigation"
import {
  formatActivityDate,
  getEffectiveInvoiceStatus,
} from "@/lib/invoices/invoice"
import { Invoice, useInvoices } from "@/hooks/use-invoice"
import SingleInvoiceSkeleton from "@/components/invoices/invoice-skeleton"

export default function InvoiceDetailsPage() {
  const params = useParams<{ id: string }>()

  const { data, isLoading } = useInvoices({
    page: 1,
    pageSize: 1,
    search: params?.id,
  })

  const firstInvoice = data?.data?.[0] as Invoice

  const effectiveStatus =
    firstInvoice !== undefined ? getEffectiveInvoiceStatus(firstInvoice) : null

  const isPaid = effectiveStatus === "Paid"

  if (!data?.data) {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <Link
          href="/dashboard/invoices"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to invoices
        </Link>

        {isLoading && <SingleInvoiceSkeleton />}
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
              {data.data?.[0]?.invoiceNumber}
            </h1>

            <InvoiceStatusBadge status={effectiveStatus ?? "Draft"} />
          </div>

          <p className="text-sm text-muted-foreground">
            Issued {formatActivityDate(data.data?.[0]?.issueDate)} · Due{" "}
            {formatActivityDate(data.data?.[0]?.dueDate)}
          </p>
        </div>

        <InvoiceActions invoice={firstInvoice} />
      </div>

      <InvoiceSummary invoice={data.data?.[0]} />
      <InvoiceItems invoice={data.data?.[0]} />
      {effectiveStatus === "Cancelled" ? (
        <InvoiceCancellation invoice={data.data?.[0]} />
      ) : (
        <>
          {(isPaid ||
            effectiveStatus === "Sent" ||
            effectiveStatus === "Overdue") && (
            <InvoicePayment invoice={data.data?.[0]} />
          )}
        </>
      )}
    </div>
  )
}

function InvoiceCancellation({ invoice }: { invoice: Invoice | undefined }) {
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

          {invoice?.cancelledAt && (
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
