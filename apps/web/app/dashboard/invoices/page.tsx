"use client"

import { InvoicePageHeader } from "@/components/invoices/invoice-page-header"
import { InvoiceStats } from "@/components/invoices/invoice-stats"
import { DataTable } from "@/components/invoices/data-table"
import { useInvoices } from "@/hooks/use-invoice"

export default function InvoicesPage() {
  const { invoices } = useInvoices()

  return (
    <div className="space-y-8">
      <InvoicePageHeader />

      <InvoiceStats invoices={invoices} />

      <section className="space-y-4">
        <DataTable data={invoices} />
      </section>
    </div>
  )
}
