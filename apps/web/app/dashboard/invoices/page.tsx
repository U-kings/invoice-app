"use client"

import { InvoicePageHeader } from "@/components/invoices/invoice-page-header"
import { InvoiceStats } from "@/components/invoices/invoice-stats"
import { DataTable } from "@/components/invoices/data-table"
import { useInvoices } from "@/hooks/use-invoice"

export default function InvoicesPage() {

   const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
  } = useInvoices({
    page: 1,
    pageSize: 10,
  })

  if (isLoading) {
    return <div>Loading invoices...</div>
  }

  if (isError) {
    return (
      <div>
        {error.message}
      </div>
    )
  }

  console.log(data)

  return (
    <div className="space-y-8">
      <InvoicePageHeader />

      <InvoiceStats invoices={data?.data} />

      <section className="space-y-4">
        <DataTable data={data?.data ?? []} />
      </section>
    </div>
  )
}
