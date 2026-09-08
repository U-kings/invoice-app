"use client"

import Link from "next/link"
import { useParams } from "next/navigation"

import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileText,
  Mail,
  User,
  AlertCircle,
  RefreshCcw,
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import { Separator } from "@workspace/ui/components/separator"

import {
  useInvoiceReminder,
  type InvoiceReminderType,
} from "@/hooks/use-invoice-reminders"

function getReminderTypeLabel(type: InvoiceReminderType) {
  switch (type) {
    case "BEFORE_DUE":
      return "Before due"

    case "DUE_DATE":
      return "Due date"

    case "OVERDUE":
      return "Overdue"
  }
}

function getReminderStatus(reminder: {
  sentAt: string | null
  processingAt: string | null
  lastError: string | null
}) {
  if (reminder.sentAt) {
    return {
      label: "Sent",
      icon: CheckCircle2,
      className:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    }
  }

  if (reminder.processingAt) {
    return {
      label: "Processing",
      icon: RefreshCcw,
      className: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    }
  }

  if (reminder.lastError) {
    return {
      label: "Failed",
      icon: AlertCircle,
      className: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
    }
  }

  return {
    label: "Scheduled",
    icon: Clock3,
    className: "bg-muted text-muted-foreground",
  }
}

function formatDate(value: string | null) {
  if (!value) {
    return "—"
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function formatDateOnly(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(value))
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)
}

export default function InvoiceReminderPage() {
  const params = useParams<{
    id: string
  }>()

  const reminderId = params.id

  const { data, isLoading, isError, error, refetch } =
    useInvoiceReminder(reminderId)

  if (isLoading) {
    return <ReminderDetailsSkeleton />
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/reminders"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to reminders
        </Link>

        <div className="rounded-2xl border bg-background p-8 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-destructive" />

          <h1 className="mt-4 font-semibold">Unable to load reminder</h1>

          <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>

          <Button variant="outline" className="mt-5" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      </div>
    )
  }

  const reminder = data?.data

  if (!reminder) {
    return null
  }

  const status = getReminderStatus(reminder)

  const StatusIcon = status.icon

  const subtotal = reminder.invoice.lineItems.reduce(
    (total, item) => total + Number(item.quantity) * Number(item.rate),
    0
  )

  const discountAmount = subtotal * (Number(reminder.invoice.discount) / 100)

  const taxableAmount = Math.max(0, subtotal - discountAmount)

  const taxAmount = taxableAmount * (Number(reminder.invoice.taxRate) / 100)

  const total = taxableAmount + taxAmount

  return (
    <div className="space-y-8">
      {/* Header */}

      <div className="space-y-5">
        <Link
          href="/dashboard/reminders"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to reminders
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">
                Invoice reminder
              </h1>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
              >
                <StatusIcon className="h-3.5 w-3.5" />

                {status.label}
              </span>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Reminder for invoice{" "}
              <span className="font-medium text-foreground">
                {reminder.invoice.invoiceNumber}
              </span>
            </p>
          </div>

          <Button
            variant="outline"
            nativeButton={false}
            render={
              <Link
                href={`/dashboard/invoices/${reminder.invoice.invoiceNumber}`}
              />
            }
          >
            <FileText className="h-4 w-4" />
            View invoice
          </Button>
        </div>
      </div>

      {/* Main grid */}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Reminder information */}

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Reminder details</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <DetailItem
                icon={Mail}
                label="Reminder type"
                value={getReminderTypeLabel(reminder.type)}
              />

              <DetailItem
                icon={CalendarClock}
                label="Scheduled for"
                value={formatDate(reminder.scheduledFor)}
              />

              <DetailItem
                icon={Clock3}
                label="Processing started"
                value={formatDate(reminder.processingAt)}
              />

              <DetailItem
                icon={CheckCircle2}
                label="Sent at"
                value={formatDate(reminder.sentAt)}
              />
            </div>

            <Separator />

            <div className="grid gap-6 sm:grid-cols-2">
              <DetailItem
                icon={RefreshCcw}
                label="Attempts"
                value={String(reminder.attempts)}
              />

              <DetailItem
                icon={CalendarClock}
                label="Invoice due date"
                value={formatDateOnly(reminder.invoice.dueDate)}
              />
            </div>

            {reminder.lastError && (
              <>
                <Separator />

                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />

                    <div className="min-w-0">
                      <p className="font-medium text-destructive">
                        Last delivery error
                      </p>

                      <p className="mt-1 text-sm wrap-break-word text-muted-foreground">
                        {reminder.lastError}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Customer */}

        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="min-w-0">
                <p className="font-medium">{reminder.invoice.customer.name}</p>

                <a
                  href={`mailto:${reminder.invoice.customer.email}`}
                  className="mt-1 block truncate text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {reminder.invoice.customer.email}
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice summary */}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Invoice summary</CardTitle>

            <Link
              href={`/dashboard/invoices/${reminder.invoice.invoiceNumber}`}
              className="text-sm font-medium text-primary hover:underline"
            >
              View invoice
            </Link>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryItem
              label="Invoice number"
              value={reminder.invoice.invoiceNumber}
            />

            <SummaryItem
              label="Issue date"
              value={formatDateOnly(reminder.invoice.issueDate)}
            />

            <SummaryItem
              label="Due date"
              value={formatDateOnly(reminder.invoice.dueDate)}
            />

            <SummaryItem
              label="Amount"
              value={formatCurrency(total, reminder.invoice.currency)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail
  label: string
  value: string
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>

        <p className="mt-1 text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>

      <p className="mt-1 font-medium">{value}</p>
    </div>
  )
}

function ReminderDetailsSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="space-y-4">
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="h-8 w-64 rounded bg-muted" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="h-80 rounded-2xl border bg-muted/40 lg:col-span-2" />
        <div className="h-40 rounded-2xl border bg-muted/40" />
      </div>

      <div className="h-36 rounded-2xl border bg-muted/40" />
    </div>
  )
}
