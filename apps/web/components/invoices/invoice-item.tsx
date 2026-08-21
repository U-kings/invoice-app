import { Separator } from "@workspace/ui/components/separator"
import { formatCurrency } from "@/lib/currency"
import { Invoice } from "@/hooks/use-invoice"

interface InvoiceItemsProps {
  invoice: Invoice | undefined
}

export function InvoiceItems({ invoice }: InvoiceItemsProps) {
  const subtotal = invoice?.lineItems.reduce(
    (total, item) => total + item.quantity * item.rate,
    0
  )

  const taxRate = invoice?.taxRate
  const tax = subtotal && subtotal * (taxRate ?? 0 / 100)
  const total = subtotal && subtotal + (tax ?? 0)
  const currency = invoice?.currency
  return (
    <div className="rounded-2xl border bg-background">
      {/* Desktop/tablet header */}
      <div className="hidden grid-cols-[1fr_100px_140px_140px] gap-4 border-b bg-muted/30 px-6 py-3 text-xs font-medium tracking-wider text-muted-foreground uppercase sm:grid">
        <span>Description</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Rate</span>
        <span className="text-right">Amount</span>
      </div>

      {/* Items */}
      <div className="divide-y">
        {invoice?.lineItems?.map((item) => {
          const amount = item.quantity * item.rate

          return (
            <div
              key={item.id}
              className="grid gap-3 px-6 py-4 sm:grid-cols-[1fr_100px_140px_140px] sm:items-center sm:gap-4"
            >
              <div>
                <p className="font-medium">{item.description}</p>

                {/* Mobile-only metadata */}
                <div className="mt-1 flex gap-3 text-xs text-muted-foreground sm:hidden">
                  <span>Qty: {item.quantity}</span>

                  <span>Rate: {formatCurrency(item.rate, currency)}</span>
                </div>
              </div>

              <span className="hidden text-right text-sm text-muted-foreground sm:block">
                {item.quantity}
              </span>

              <span className="hidden text-right text-sm text-muted-foreground sm:block">
                {formatCurrency(item.rate, currency)}
              </span>

              <span className="text-right font-medium">
                {formatCurrency(amount, currency)}
              </span>
            </div>
          )
        })}
      </div>

      <Separator />

      {/* Totals */}
      <div className="px-6 py-5">
        <div className="ml-auto w-full space-y-3 sm:max-w-sm">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>

            <span className="font-medium">
              {formatCurrency(subtotal, currency)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tax ({taxRate}%)</span>

            <span className="font-medium">{formatCurrency(tax, currency)}</span>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <span className="text-base font-semibold">Total</span>

            <span className="text-xl font-semibold">
              {formatCurrency(total, currency)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
