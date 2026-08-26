"use client"

import { InvoiceFormEdit } from "@/components/invoices/invoice-form-edit"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { prisma } from "@repo/db"
import { Invoice, useInvoices } from "@/hooks/use-invoice"
import { useParams } from "next/navigation"

export default function EditInvoicePage() {
  const params = useParams<{ id: string }>()

  const { data, isLoading } = useInvoices({
    page: 1,
    pageSize: 1,
    search: params?.id,
  })
  // const invoice = await prisma.invoice.findUnique({
  //   where: { id: invoiceNumber },
  //   include: { lineItems: true },
  // })

  if (!data?.data) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard/invoices"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to invoices
        </Link>

        <h1 className="text-2xl font-semibold">Invoice not found</h1>

        <p className="text-sm text-muted-foreground">
          The invoice you&apos;re trying to edit could not be found.
        </p>
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
          Update the details of {data?.data[0]?.invoiceNumber}.
        </p>
      </div>

      <InvoiceFormEdit invoice={data?.data[0]} />
    </div>
  )
}
