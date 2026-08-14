import { InvoicePageHeader } from "@/components/invoices/invoice-page-header"
import { InvoiceStats } from "@/components/invoices/invoice-stats"
import { InvoiceFilters } from "@/components/invoices/invoice-filters"
import { DataTable } from "@/components/invoices/data-table"
import { invoices } from "@/components/invoices/invoice-data"

export default function InvoicesPage() {
  return (
    <div className="space-y-8">
      <InvoicePageHeader />

      <InvoiceStats />

      <section className="space-y-4">
        {/* <InvoiceFilters /> */}
        <DataTable data={invoices} />
      </section>
    </div>
  )
}
