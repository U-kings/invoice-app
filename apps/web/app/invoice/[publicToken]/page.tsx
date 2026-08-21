import { notFound } from "next/navigation"
import { prisma } from "@repo/db"
import { InvoiceActions } from "./invoice-actions"

type PublicInvoicePageProps = {
  params: Promise<{
    publicToken: string
  }>
}

const PUBLIC_STATUSES = [
  "SENT",
  "PAID",
  "OVERDUE",
]

export default async function PublicInvoicePage({
  params,
}: PublicInvoicePageProps) {
  const { publicToken } = await params

  const invoice = await prisma.invoice.findUnique({
    where: {
      publicToken,
    },
    include: {
      customer: true,
      lineItems: true,
    },
  })

  if (!invoice) {
    notFound()
  }

  if (!PUBLIC_STATUSES.includes(invoice.status)) {
    notFound()
  }

  const subtotal = invoice.lineItems.reduce<number>(
    (sum, item) =>
      sum +
      Number(item.rate) * item.quantity,
    0
  )

  const discount = Number(invoice.discount)

  const taxableAmount = Math.max(
    subtotal - discount,
    0
  )

  const taxRate = Number(invoice.taxRate)

  const tax =
    taxableAmount * (taxRate / 100)

  const total =
    taxableAmount + tax

  return (
    <main className="min-h-screen bg-muted/30 py-6 sm:py-10 print:bg-white print:py-0">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <InvoiceActions
          publicToken={invoice.publicToken}
        />

        <div
          id="invoice"
          className="overflow-hidden rounded-2xl border bg-background shadow-sm print:rounded-none print:border-0 print:shadow-none"
        >
          {/* Header */}
          <header className="border-b px-6 py-7 sm:px-10 sm:py-9">
            <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex size-11 items-center justify-center rounded-xl bg-[#2EAFB4] text-sm font-bold text-white">
                  IN
                </div>

                <h2 className="mt-4 text-lg font-semibold tracking-tight">
                  Your Company
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Professional invoicing made simple.
                </p>
              </div>

              <div className="sm:text-right">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#2EAFB4]">
                  Invoice
                </p>

                <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                  {invoice.invoiceNumber}
                </h1>

                <InvoiceStatus
                  status={invoice.status}
                />
              </div>
            </div>
          </header>

          {/* Invoice details */}
          <section className="grid gap-8 border-b px-6 py-8 sm:grid-cols-2 sm:px-10 lg:grid-cols-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Billed to
              </p>

              <div className="mt-3">
                <p className="font-semibold">
                  {invoice.customer.name}
                </p>

                {invoice.customer.email && (
                  <p className="mt-1 break-all text-sm text-muted-foreground">
                    {invoice.customer.email}
                  </p>
                )}
              </div>
            </div>

            <InvoiceDetail
              label="Issue date"
              value={formatDate(invoice.issueDate)}
            />

            <InvoiceDetail
              label="Due date"
              value={formatDate(invoice.dueDate)}
            />

            <InvoiceDetail
              label="Payment terms"
              value={
                invoice.paymentTerm ??
                "Due on receipt"
              }
            />
          </section>

          {/* Line items */}
          <section className="px-6 py-8 sm:px-10">
            <div className="overflow-hidden rounded-xl border">
              {/* Desktop heading */}
              <div className="hidden grid-cols-[1fr_70px_120px_130px] gap-4 bg-muted/50 px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground sm:grid">
                <span>Description</span>
                <span className="text-right">
                  Qty
                </span>
                <span className="text-right">
                  Rate
                </span>
                <span className="text-right">
                  Amount
                </span>
              </div>

              {invoice.lineItems.map((item) => {
                const amount =
                  Number(item.rate) *
                  item.quantity

                return (
                  <div
                    key={item.id}
                    className="grid gap-3 border-t px-5 py-5 sm:grid-cols-[1fr_70px_120px_130px] sm:items-center sm:gap-4"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {item.description}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground sm:hidden">
                        {item.quantity} ×{" "}
                        {formatCurrency(
                          Number(item.rate),
                          invoice.currency
                        )}
                      </p>
                    </div>

                    <div className="hidden text-right text-sm text-muted-foreground sm:block">
                      {item.quantity}
                    </div>

                    <div className="hidden text-right text-sm sm:block">
                      {formatCurrency(
                        Number(item.rate),
                        invoice.currency
                      )}
                    </div>

                    <div className="text-right text-sm font-medium">
                      {formatCurrency(
                        amount,
                        invoice.currency
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Totals */}
          <section className="border-t px-6 py-8 sm:px-10">
            <div className="ml-auto w-full max-w-sm">
              <div className="space-y-3">
                <SummaryRow
                  label="Subtotal"
                  value={formatCurrency(
                    subtotal,
                    invoice.currency
                  )}
                />

                {discount > 0 && (
                  <SummaryRow
                    label="Discount"
                    value={`- ${formatCurrency(
                      discount,
                      invoice.currency
                    )}`}
                  />
                )}

                {tax > 0 && (
                  <SummaryRow
                    label={`Tax (${taxRate}%)`}
                    value={formatCurrency(
                      tax,
                      invoice.currency
                    )}
                  />
                )}
              </div>

              <div className="mt-5 flex items-center justify-between rounded-xl bg-muted/50 px-4 py-4">
                <span className="text-sm font-medium">
                  Total
                </span>

                <span className="text-xl font-semibold tracking-tight text-[#2EAFB4]">
                  {formatCurrency(
                    total,
                    invoice.currency
                  )}
                </span>
              </div>
            </div>
          </section>

          {/* Notes */}
          {invoice.notes && (
            <section className="border-t px-6 py-8 sm:px-10">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Notes
              </p>

              <p className="mt-3 max-w-2xl whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                {invoice.notes}
              </p>
            </section>
          )}

          {/* Footer */}
          <footer className="border-t bg-muted/30 px-6 py-7 text-center sm:px-10">
            <p className="text-sm font-medium">
              Thank you for your business.
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              This invoice was generated electronically.
            </p>
          </footer>
        </div>
      </div>
    </main>
  )
}

function InvoiceDetail({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>

      <p className="mt-3 text-sm font-medium">
        {value}
      </p>
    </div>
  )
}

function SummaryRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">
        {label}
      </span>

      <span>{value}</span>
    </div>
  )
}

function InvoiceStatus({
  status,
}: {
  status: string
}) {
  const statusStyles: Record<
    string,
    string
  > = {
    PAID:
      "bg-emerald-500/10 text-emerald-600",
    SENT:
      "bg-blue-500/10 text-blue-600",
    OVERDUE:
      "bg-red-500/10 text-red-600",
  }

  return (
    <span
      className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        statusStyles[status] ??
        "bg-muted text-muted-foreground"
      }`}
    >
      {formatStatus(status)}
    </span>
  )
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    )
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat(
    "en-NG",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date)
}

function formatCurrency(
  amount: number,
  currency: string
) {
  try {
    return new Intl.NumberFormat(
      "en-NG",
      {
        style: "currency",
        currency,
      }
    ).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}