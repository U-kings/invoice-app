import { Separator } from "@workspace/ui/components/separator"

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  rate: number
}

const items: InvoiceItem[] = [
  {
    id: "1",
    description: "Website development",
    quantity: 1,
    rate: 2000,
  },
  {
    id: "2",
    description: "UI/UX design",
    quantity: 1,
    rate: 1000,
  },
  {
    id: "3",
    description: "Hosting & maintenance",
    quantity: 2,
    rate: 250,
  },
]

const subtotal = items.reduce(
  (total, item) => total + item.quantity * item.rate,
  0,
)

const taxRate = 10
const tax = subtotal * (taxRate / 100)
const total = subtotal + tax

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value)
}

export function InvoiceItems() {
  return (
    <div className="rounded-2xl border bg-background">
      {/* Desktop/tablet header */}
      <div className="hidden grid-cols-[1fr_100px_140px_140px] gap-4 border-b bg-muted/30 px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground sm:grid">
        <span>Description</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Rate</span>
        <span className="text-right">Amount</span>
      </div>

      {/* Items */}
      <div className="divide-y">
        {items.map((item) => {
          const amount = item.quantity * item.rate

          return (
            <div
              key={item.id}
              className="grid gap-3 px-6 py-4 sm:grid-cols-[1fr_100px_140px_140px] sm:items-center sm:gap-4"
            >
              <div>
                <p className="font-medium">
                  {item.description}
                </p>

                {/* Mobile-only metadata */}
                <div className="mt-1 flex gap-3 text-xs text-muted-foreground sm:hidden">
                  <span>
                    Qty: {item.quantity}
                  </span>

                  <span>
                    Rate: {formatCurrency(item.rate)}
                  </span>
                </div>
              </div>

              <span className="hidden text-right text-sm text-muted-foreground sm:block">
                {item.quantity}
              </span>

              <span className="hidden text-right text-sm text-muted-foreground sm:block">
                {formatCurrency(item.rate)}
              </span>

              <span className="text-right font-medium">
                {formatCurrency(amount)}
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
            <span className="text-muted-foreground">
              Subtotal
            </span>

            <span className="font-medium">
              {formatCurrency(subtotal)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Tax ({taxRate}%)
            </span>

            <span className="font-medium">
              {formatCurrency(tax)}
            </span>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <span className="text-base font-semibold">
              Total
            </span>

            <span className="text-xl font-semibold">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}