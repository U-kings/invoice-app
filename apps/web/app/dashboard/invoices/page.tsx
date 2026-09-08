"use client"

import { InvoicePageHeader } from "@/components/invoices/invoice-page-header"
import { InvoiceStats } from "@/components/invoices/invoice-stats"
import { DataTable } from "@/components/invoices/data-table"
import { useInvoices } from "@/hooks/use-invoice"
import { InvoiceSkeleton } from "@/components/invoices/invoice-skeleton"
import { ErrorState } from "@/components/common/error-state"

export default function InvoicesPage() {
  const { data, isLoading, isFetching, isError, error, refetch } = useInvoices({
    page: 1,
    pageSize: 10,
  })

  return (
    <>
      <div className="overflow-clip">
        {isError ? (
          <ErrorState
            title={
              error.message?.toString()?.includes("Can't reach database server")
                ? "Unable to connect to the database. Please check your network or try again later."
                : error.message
            }
            description="We couldn't fetch your invoices. Please try again."
            onRetry={() => refetch()}
          />
        ) : (
          // <div className="p-6 text-sm text-destructive">
          //   {error.message?.toString()?.includes("Can't reach database server")
          //     ? "Unable to connect to the database. Please check your network or try again later."
          //     : error.message}
          // </div>
          <div className="space-y-8">
            <InvoicePageHeader />

            {isLoading ? (
              <InvoiceSkeleton />
            ) : (
              <>
                <InvoiceStats invoices={data?.data} />

                <section className="space-y-4">
                  {/* <DataTable data={data?.data ?? []} /> */}
                  <DataTable />
                </section>
              </>
            )}
          </div>
        )}
      </div>
    </>
  )
}
