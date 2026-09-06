"use client"

import * as React from "react"
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CircleDollarSign,
  Clock3,
  FileText,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react"

import { useReports, type ReportPeriod } from "@/hooks/use-reports"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Skeleton } from "@workspace/ui/components/skeleton"

type CurrencyAmounts = Record<string, number>

function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })}`
  }
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

function formatShortDate(date: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(date))
}

function getCurrencyEntries(amounts: CurrencyAmounts) {
  return Object.entries(amounts).filter(
    ([, amount]) => Number.isFinite(amount) && amount !== 0
  )
}

function formatCurrencyAmounts(amounts: CurrencyAmounts, emptyLabel = "—") {
  const entries = getCurrencyEntries(amounts)

  if (entries.length === 0) {
    return emptyLabel
  }

  return entries
    .map(([currency, amount]) => formatCurrency(amount, currency))
    .join(" · ")
}

function getStatusLabel(status: string) {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function getStatusClassName(status: string) {
  switch (status.toUpperCase()) {
    case "PAID":
    case "SUCCESS":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"

    case "SENT":
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400"

    case "OVERDUE":
      return "bg-red-500/10 text-red-600 dark:text-red-400"

    case "CANCELLED":
      return "bg-muted text-muted-foreground"

    case "DRAFT":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400"

    default:
      return "bg-muted text-muted-foreground"
  }
}

const periodLabels: Record<ReportPeriod, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  "12m": "Last 12 months",
}

function CurrencyValue({
  amounts,
  className,
}: {
  amounts: CurrencyAmounts
  className?: string
}) {
  const entries = getCurrencyEntries(amounts)

  if (entries.length === 0) {
    return <span className={className}>—</span>
  }

  if (entries.length === 1 && entries[0]) {
    const [currency, amount] = entries[0]

    return <span className={className}>{formatCurrency(amount, currency)}</span>
  }

  return (
    <span className={className}>
      {entries.map(([currency, amount], index) => (
        <React.Fragment key={currency}>
          {index > 0 && <span className="mx-1 text-muted-foreground">·</span>}
          {formatCurrency(amount, currency)}
        </React.Fragment>
      ))}
    </span>
  )
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Skeleton className="h-4 w-28" />
      </CardHeader>

      <CardContent>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-2 h-3 w-24" />
      </CardContent>
    </Card>
  )
}

function ReportsLoading() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-2 h-4 w-56" />
          </CardHeader>

          <CardContent>
            <Skeleton className="h-70 w-full" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-2 h-4 w-48" />
          </CardHeader>

          <CardContent>
            <div className="space-y-5">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index}>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="mt-2 h-2 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="mt-2 h-3 w-24" />
                  </div>

                  <Skeleton className="h-5 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="mt-2 h-3 w-24" />
                  </div>

                  <Skeleton className="h-5 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <div className="flex min-h-55 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
      <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted">
        <Icon className="size-5 text-muted-foreground" />
      </div>

      <p className="font-medium">{title}</p>

      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  )
}

export default function ReportsPage() {
  const [period, setPeriod] = React.useState<ReportPeriod>("30d")

  const { data, isLoading, isFetching, isError, error, refetch } =
    useReports(period)

  const handlePeriodChange = (value: string | null) => {
    setPeriod(value as ReportPeriod)
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <header>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Understand your invoicing performance and cash flow.
              </p>
            </div>

            <Skeleton className="h-9 w-40" />
          </div>
        </header>

        <ReportsLoading />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Understand your invoicing performance and cash flow.
          </p>
        </header>

        <Card>
          <CardContent className="flex min-h-80 flex-col items-center justify-center text-center">
            <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="size-6 text-destructive" />
            </div>

            <h2 className="font-semibold">Unable to load reports</h2>

            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "Something went wrong while loading your reports."}
            </p>

            <Button
              type="button"
              variant="outline"
              className="mt-5"
              onClick={() => refetch()}
            >
              <RefreshCw className="mr-2 size-4" />
              Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const {
    overview,
    revenueTrend,
    invoiceStatus,
    outstandingInvoices,
    topCustomers,
  } = data

  const totalInvoiced = getCurrencyEntries(overview.totalInvoiced)

  const totalPaid = getCurrencyEntries(overview.totalPaid)

  const totalOutstanding = getCurrencyEntries(overview.totalOutstanding)

  const totalOverdue = getCurrencyEntries(overview.totalOverdue)

  const maxRevenue = Math.max(
    ...revenueTrend.map((item) => Math.abs(item.amount)),
    0
  )

  const statusTotal = invoiceStatus.reduce((sum, item) => sum + item.count, 0)

  const maxStatusCount = Math.max(...invoiceStatus.map((item) => item.count), 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Reports</h1>

            {isFetching && !isLoading && (
              <RefreshCw className="size-4 animate-spin text-muted-foreground" />
            )}
          </div>

          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Understand your invoicing performance and cash flow.
          </p>
        </div>

        <Select value={period} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-full sm:w-42.5">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="7d">{periodLabels["7d"]}</SelectItem>

            <SelectItem value="30d">{periodLabels["30d"]}</SelectItem>

            <SelectItem value="90d">{periodLabels["90d"]}</SelectItem>

            <SelectItem value="12m">{periodLabels["12m"]}</SelectItem>
          </SelectContent>
        </Select>
      </header>

      {/* Overview */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">
              Total invoiced
            </CardTitle>

            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="size-4 text-primary" />
            </div>
          </CardHeader>

          <CardContent>
            <CurrencyValue
              amounts={overview.totalInvoiced}
              className="text-2xl font-semibold tracking-tight"
            />

            <p className="mt-1 text-xs text-muted-foreground">
              {overview.invoiceCount}{" "}
              {overview.invoiceCount === 1 ? "invoice" : "invoices"} created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">
              Amount received
            </CardTitle>

            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10">
              <ArrowDownRight className="size-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>

          <CardContent>
            <CurrencyValue
              amounts={overview.totalPaid}
              className="text-2xl font-semibold tracking-tight"
            />

            <p className="mt-1 text-xs text-muted-foreground">
              Successful payments during this period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>

            <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10">
              <Clock3 className="size-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>

          <CardContent>
            <CurrencyValue
              amounts={overview.totalOutstanding}
              className="text-2xl font-semibold tracking-tight"
            />

            <p className="mt-1 text-xs text-muted-foreground">
              Remaining balances on invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>

            <div className="flex size-9 items-center justify-center rounded-lg bg-red-500/10">
              <ArrowUpRight className="size-4 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>

          <CardContent>
            <CurrencyValue
              amounts={overview.totalOverdue}
              className="text-2xl font-semibold tracking-tight"
            />

            <p className="mt-1 text-xs text-muted-foreground">
              Outstanding balances past due
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Revenue + Status */}
      <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        {/* Revenue trend */}
        <Card className="min-w-0">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="size-4" />
                  Revenue trend
                </CardTitle>

                <CardDescription>
                  Successful payments received during{" "}
                  {periodLabels[period].toLowerCase()}.
                </CardDescription>
              </div>

              <BarChart3 className="hidden size-5 text-muted-foreground sm:block" />
            </div>
          </CardHeader>

          <CardContent>
            {revenueTrend.length === 0 ? (
              <EmptyState
                icon={CircleDollarSign}
                title="No payments yet"
                description="Successful payments received during this period will appear here."
              />
            ) : (
              <div className="space-y-5">
                {revenueTrend.map((item, index) => {
                  const width =
                    maxRevenue > 0
                      ? Math.max((Math.abs(item.amount) / maxRevenue) * 100, 4)
                      : 0

                  return (
                    <div key={`${item.date}-${item.currency}-${index}`}>
                      <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                        <span className="shrink-0 text-muted-foreground">
                          {formatShortDate(item.date)}
                        </span>

                        <span className="font-medium">
                          {formatCurrency(item.amount, item.currency)}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{
                            width: `${width}%`,
                          }}
                        />
                      </div>

                      <div className="mt-1 text-xs text-muted-foreground">
                        {item.currency}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invoice status */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice status</CardTitle>

            <CardDescription>
              Distribution of invoices created during{" "}
              {periodLabels[period].toLowerCase()}.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {invoiceStatus.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No invoices yet"
                description="Invoice status data will appear here once you create invoices."
              />
            ) : (
              <div className="space-y-5">
                {invoiceStatus.map((item) => {
                  const percentage =
                    statusTotal > 0 ? (item.count / statusTotal) * 100 : 0

                  const barWidth =
                    maxStatusCount > 0 ? (item.count / maxStatusCount) * 100 : 0

                  return (
                    <div key={item.status}>
                      <div className="mb-2 flex items-center justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className={`inline-flex shrink-0 rounded-full px-2 py-1 text-xs font-medium ${getStatusClassName(
                              item.status
                            )}`}
                          >
                            {getStatusLabel(item.status)}
                          </span>
                        </div>

                        <div className="flex shrink-0 items-center gap-2 text-sm">
                          <span className="font-medium">{item.count}</span>

                          <span className="text-muted-foreground">
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{
                            width: `${barWidth}%`,
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Outstanding + Top Customers */}
      <section className="grid gap-6 xl:grid-cols-2">
        {/* Outstanding invoices */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>Outstanding invoices</CardTitle>

                <CardDescription>
                  Remaining balances that still need to be collected.
                </CardDescription>
              </div>

              <Clock3 className="size-5 text-muted-foreground" />
            </div>
          </CardHeader>

          <CardContent>
            {outstandingInvoices.length === 0 ? (
              <EmptyState
                icon={CircleDollarSign}
                title="Nothing outstanding"
                description="Invoices with remaining balances will appear here."
              />
            ) : (
              <div className="space-y-1">
                {outstandingInvoices.slice(0, 8).map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between gap-4 rounded-lg px-2 py-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium">
                          {invoice.invoiceNumber}
                        </p>

                        <span
                          className={`hidden shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium sm:inline-flex ${getStatusClassName(
                            invoice.status
                          )}`}
                        >
                          {getStatusLabel(invoice.status)}
                        </span>
                      </div>

                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {invoice.customerName}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Due {formatDate(invoice.dueDate)}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold">
                        {formatCurrency(invoice.amount, invoice.currency)}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {invoice.currency}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top customers */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>Top customers</CardTitle>

                <CardDescription>
                  Customers ranked by invoiced value for this period.
                </CardDescription>
              </div>

              <Users className="size-5 text-muted-foreground" />
            </div>
          </CardHeader>

          <CardContent>
            {topCustomers.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No customer activity"
                description="Customer activity will appear here once invoices are created."
              />
            ) : (
              <div className="space-y-1">
                {topCustomers.slice(0, 8).map((customer, index) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between gap-4 rounded-lg px-2 py-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {index + 1}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {customer.name}
                        </p>

                        <p className="truncate text-xs text-muted-foreground">
                          {customer.email}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {customer.invoiceCount}{" "}
                          {customer.invoiceCount === 1 ? "invoice" : "invoices"}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <CurrencyValue
                        amounts={customer.totalInvoiced}
                        className="text-sm font-semibold"
                      />

                      <p className="mt-1 text-xs text-muted-foreground">
                        invoiced
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Currency summary */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Currency summary</CardTitle>

            <CardDescription>
              Financial totals are kept separate by currency. No cross-currency
              conversion is performed.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border p-4">
                <p className="text-sm text-muted-foreground">Invoiced</p>

                <div className="mt-3 space-y-1">
                  {totalInvoiced.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No data</p>
                  ) : (
                    totalInvoiced.map(([currency, amount]) => (
                      <div
                        key={currency}
                        className="flex items-center justify-between gap-3"
                      >
                        <span className="text-xs font-medium text-muted-foreground">
                          {currency}
                        </span>

                        <span className="text-sm font-semibold">
                          {formatCurrency(amount, currency)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-xl border p-4">
                <p className="text-sm text-muted-foreground">Received</p>

                <div className="mt-3 space-y-1">
                  {totalPaid.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No data</p>
                  ) : (
                    totalPaid.map(([currency, amount]) => (
                      <div
                        key={currency}
                        className="flex items-center justify-between gap-3"
                      >
                        <span className="text-xs font-medium text-muted-foreground">
                          {currency}
                        </span>

                        <span className="text-sm font-semibold">
                          {formatCurrency(amount, currency)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-xl border p-4">
                <p className="text-sm text-muted-foreground">Outstanding</p>

                <div className="mt-3 space-y-1">
                  {totalOutstanding.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No data</p>
                  ) : (
                    totalOutstanding.map(([currency, amount]) => (
                      <div
                        key={currency}
                        className="flex items-center justify-between gap-3"
                      >
                        <span className="text-xs font-medium text-muted-foreground">
                          {currency}
                        </span>

                        <span className="text-sm font-semibold">
                          {formatCurrency(amount, currency)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-xl border p-4">
                <p className="text-sm text-muted-foreground">Overdue</p>

                <div className="mt-3 space-y-1">
                  {totalOverdue.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No data</p>
                  ) : (
                    totalOverdue.map(([currency, amount]) => (
                      <div
                        key={currency}
                        className="flex items-center justify-between gap-3"
                      >
                        <span className="text-xs font-medium text-muted-foreground">
                          {currency}
                        </span>

                        <span className="text-sm font-semibold">
                          {formatCurrency(amount, currency)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
