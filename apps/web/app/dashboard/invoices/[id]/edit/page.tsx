"use client"

import { InvoiceFormEdit } from "@/components/invoices/invoice-form-edit"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { prisma } from "@repo/db"
import { Invoice, useInvoice, useInvoices } from "@/hooks/use-invoice"
import { useParams } from "next/navigation"
import EditInvoiceSkeleton from "@/components/invoices/edit-invoice-skeleton"
import { ErrorState } from "@/components/common/error-state"

export default function EditInvoicePage() {
  const params = useParams<{ id: string }>()
  const defaultInvoiceSkeleton: Invoice = {
    id: "",
    invoiceNumber: "",
    customerId: "",
    status: "Draft",
    currency: "USD",
    issueDate: new Date().toISOString(),
    dueDate: new Date().toISOString(),
    paymentTerm: null,
    discount: 0,
    taxRate: 0,
    notes: "",
    lineItems: [],
  }

  const {
    data: invoiceRecord,
    isLoading,
    isError,
    error,
  } = useInvoice(params?.id)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard/invoices"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to invoices
        </Link>

        <EditInvoiceSkeleton />
      </div>
    )
  }

  if (isError || !invoiceRecord) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard/invoices"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to invoices
        </Link>

        <ErrorState
          title="Error Loading Invoice"
          description={error?.message}
        />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/dashboard/invoices"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to invoices
        </Link>
        <h1 className="text-2xl font-semibold">Edit invoice</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Update the details of {invoiceRecord?.invoiceNumber}.
        </p>
      </div>

      <InvoiceFormEdit invoice={invoiceRecord} />
    </div>
  )
}
