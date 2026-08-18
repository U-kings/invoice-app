import { Banknote, CalendarDays, CheckCircle2, CreditCard } from "lucide-react"

import { InvoiceStatusBadge } from "./invoice-status-badge"
import { Invoice } from "./invoice-data"
import { getEffectiveInvoiceStatus } from "./invoice-storage"
import { formatCurrency } from "@/lib/currency"
import { formatActivityDate, getInvoiceTotal } from "@/lib/invoice/invoice"

interface InvoicePaymentProps {
  invoice: Invoice
}

function formatPaidDate(date?: string) {
  if (!date) {
    return "Not paid yet"
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

export function InvoicePayment({ invoice }: InvoicePaymentProps) {
  const status = getEffectiveInvoiceStatus(invoice)

  const isPaid = status === "Paid"
  // const isCancelled = status === "Overdue"

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Payment information */}
      <div className="rounded-2xl border bg-background p-6">
        <div className="mb-5">
          <h2 className="font-semibold">Payment information</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Details about the payment for this invoice.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <CheckCircle2 className="h-4 w-4" />
              </div>

              <div>
                <p className="text-sm font-medium">Payment status</p>

                <p className="text-xs text-muted-foreground">Current status</p>
              </div>
            </div>

            <InvoiceStatusBadge status={status} />
          </div>

          {isPaid && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                  <CalendarDays className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-medium">Paid on</p>
                  {invoice.paidAt && (
                    <p className="text-sm text-muted-foreground">
                      {formatPaidDate(invoice.paidAt)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex hidden items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <Banknote className="h-4 w-4" />
              </div>

              <div>
                <p className="text-sm font-medium">Payment method</p>

                <p className="text-xs text-muted-foreground">
                  {" "}
                  {isPaid ? "Bank transfer" : "Awaiting payment"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <CreditCard className="h-4 w-4" />
              </div>

              <div>
                <p className="text-sm font-medium">
                  {isPaid ? "Amount paid" : "Amount due"}
                </p>

                <p className="text-xs text-muted-foreground">
                  {isPaid ? "Full invoice amount" : "Outstanding balance"}
                </p>
              </div>
            </div>

            <p className="font-semibold">
              {formatCurrency(getInvoiceTotal(invoice), invoice.currency)}
            </p>
          </div>
        </div>
      </div>

      {/* Activity */}
      <InvoiceActivity invoice={invoice} />
    </div>
  )
}

function InvoiceActivity({ invoice }: { invoice: Invoice }) {
  const status = getEffectiveInvoiceStatus(invoice)

  const isPaid = status === "Paid"

  console.log(invoice)

  const activities = [
    {
      title: "Invoice created",
      description: "Invoice was created.",
      date: formatActivityDate(invoice.issueDate),
    },
    ...(invoice.sentAt
      ? [
          {
            title: "Invoice sent",
            description: `Invoice was sent to ${invoice.customerEmail}.`,
            date: formatActivityDate(invoice.sentAt),
          },
        ]
      : []),
    ...(invoice.paidAt || isPaid
      ? [
          {
            title: "Invoice paid",
            description: "Payment received.",
            date: formatActivityDate(invoice.paidAt),
          },
        ]
      : []),
    ...(invoice.cancelledAt
      ? [
          {
            title: "Invoice cancelled",
            description: "Invoice was cancelled.",
            date: formatActivityDate(invoice.cancelledAt),
          },
        ]
      : []),
  ].reverse()

  // if (invoice.status.toLowerCase() === "paid" && invoice.paidAt) {
  //   activities.unshift({
  //     title: "Invoice paid",
  //     description: "Payment received.",
  //     date: formatPaidDate(invoice.paidAt),
  //   })
  // }

  return (
    <div className="rounded-2xl border bg-background p-6">
      <div className="mb-5">
        <h2 className="font-semibold">Activity</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Recent activity for this invoice.
        </p>
      </div>

      <div className="space-y-5">
        {activities.map((activity, index) => (
          <div key={index} className="relative flex gap-3">
            {index !== activities.length - 1 && (
              <div className="absolute top-8 left-4 h-[calc(100%+1.25rem)] w-px bg-border" />
            )}

            <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background">
              <div className="h-2 w-2 rounded-full bg-[#2EAFB4]" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium">{activity.title}</p>

                <span className="text-xs text-muted-foreground">
                  {activity.date}
                </span>
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                {activity.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
