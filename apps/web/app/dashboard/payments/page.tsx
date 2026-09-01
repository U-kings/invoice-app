"use client"

import { PaymentPageHeader } from "@/components/payments/payment-page-header"
import { PaymentStats } from "@/components/payments/payment-stats"
// import { PaymentDataTable } from "@/components/payments/payment-data-table"
import { usePayments } from "@/hooks/use-payment"
// import { PaymentSkeleton } from "@/components/payments/payment-skeleton"

export default function PaymentsPage() {
  const { data, isLoading, isFetching, isError, error } = usePayments({
    page: 1,
    pageSize: 10,
  })

  return (
    <>
      <div className="mx-auto max-w-7xl overflow-clip">
        {isError ? (
          <div className="p-6 text-sm text-destructive">
            {error.message?.toString()?.includes("Can't reach database server")
              ? "Unable to connect to the database. Please check your network or try again later."
              : error.message}
          </div>
        ) : (
          <div className="space-y-8">
            <PaymentPageHeader />

            {isLoading ? (
              <></>
              // <PaymentSkeleton />
            ) : (
              <>
                <PaymentStats payments={data?.payments} />

                <section className="space-y-4">
                  {/* <PaymentDataTable data={data?.payments ?? []} /> */}
                </section>
              </>
            )}
          </div>
        )}
      </div>
    </>
  )
}
