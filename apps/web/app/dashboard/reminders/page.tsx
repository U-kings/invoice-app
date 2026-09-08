"use client"

import { ReminderPageHeader } from "@/components/reminders/reminder-page-header"
import { ReminderStats } from "@/components/reminders/reminder-stats"
import { DataTable } from "@/components/reminders/data-table"
import { useInvoiceReminders } from "@/hooks/use-invoice-reminders"
import { ErrorState } from "@/components/common/error-state"

export default function RemindersPage() {
  const { data, isLoading, isError, error, refetch } = useInvoiceReminders({
    page: 1,
    pageSize: 10,
  })

  return (
    <div className="overflow-clip">
      <div className="space-y-8">
        <ReminderPageHeader />

        {isError ? (
          <ErrorState
            title={error?.message}
            description="We couldn't fetch your invoice reminders. Please try again."
            onRetry={() => refetch()}
          />
        ) : (
          // <div className="p-6 text-sm text-destructive">{error?.message}</div>
          <>
            <ReminderStats stats={data?.stats} isLoading={isLoading} />

            <section className="space-y-4">
              <DataTable />
            </section>
          </>
        )}
      </div>
    </div>
  )
}
