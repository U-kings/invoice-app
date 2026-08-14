import {
  Banknote,
  CalendarDays,
  CheckCircle2,
  CreditCard,
} from "lucide-react"

import { InvoiceStatusBadge } from "./invoice-status-badge"

export function InvoicePayment() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Payment information */}
      <div className="rounded-2xl border bg-background p-6">
        <div className="mb-5">
          <h2 className="font-semibold">
            Payment information
          </h2>

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
                <p className="text-sm font-medium">
                  Payment status
                </p>

                <p className="text-xs text-muted-foreground">
                  Current status
                </p>
              </div>
            </div>

            <InvoiceStatusBadge status="Paid" />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <CalendarDays className="h-4 w-4" />
              </div>

              <div>
                <p className="text-sm font-medium">
                  Paid on
                </p>

                <p className="text-xs text-muted-foreground">
                  August 15, 2026
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <Banknote className="h-4 w-4" />
              </div>

              <div>
                <p className="text-sm font-medium">
                  Payment method
                </p>

                <p className="text-xs text-muted-foreground">
                  Bank transfer
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
                  Amount paid
                </p>

                <p className="text-xs text-muted-foreground">
                  Full invoice amount
                </p>
              </div>
            </div>

            <p className="font-semibold">
              $3,850.00
            </p>
          </div>
        </div>
      </div>

      {/* Activity */}
      <InvoiceActivity />
    </div>
  )
}

function InvoiceActivity() {
  const activities = [
    {
      title: "Invoice paid",
      description: "Payment received via bank transfer.",
      date: "Aug 15, 2026",
    },
    {
      title: "Invoice sent",
      description: "Invoice was sent to billing@acme.com.",
      date: "Aug 10, 2026",
    },
    {
      title: "Invoice created",
      description: "Invoice was created.",
      date: "Aug 10, 2026",
    },
  ]

  return (
    <div className="rounded-2xl border bg-background p-6">
      <div className="mb-5">
        <h2 className="font-semibold">
          Activity
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Recent activity for this invoice.
        </p>
      </div>

      <div className="space-y-5">
        {activities.map((activity, index) => (
          <div
            key={activity.title}
            className="relative flex gap-3"
          >
            {index !== activities.length - 1 && (
              <div className="absolute top-8 left-4 h-[calc(100%+1.25rem)] w-px bg-border" />
            )}

            <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background">
              <div className="h-2 w-2 rounded-full bg-[#2EAFB4]" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium">
                  {activity.title}
                </p>

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