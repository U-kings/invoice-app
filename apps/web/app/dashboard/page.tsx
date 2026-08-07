import { StatsGrid } from "@/components/dashboard/stats-grid"
import { RevenueOverview } from "@/components/dashboard/revenue-overview"
import { RecentInvoices } from "@/components/dashboard/recent-invoices"
import { InvoiceStatus } from "@/components/dashboard/invoice-status"
import { RecentPayments } from "@/components/dashboard/recent-payments"
import { UpcomingInvoices } from "@/components/dashboard/upcoming-invoices"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { ActivityFeed } from "@/components/dashboard/activity-feed"

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Dashboard</h1>

        <p className="mt-2 text-muted-foreground">
          Welcome back! Here&apos;s what&apos;s happening with your business
          today.
        </p>
      </div>

      <StatsGrid />

      <section className="grid gap-6 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <RevenueOverview />
        </div>

        <div className="xl:col-span-5">
          <RecentInvoices />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <InvoiceStatus />

        <RecentPayments />

        <UpcomingInvoices />
      </section>

      <section className="grid gap-6 xl:grid-cols-12">
        <div className="xl:col-span-4">
          <QuickActions />
        </div>

        <div className="xl:col-span-8">
          <ActivityFeed />
        </div>
      </section>
    </div>
  )
}

// if (isLoading) {
//   return <DashboardSkeleton />;
// }
