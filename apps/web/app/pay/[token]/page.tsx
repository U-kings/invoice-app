"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, Loader2, ShieldCheck } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

import { usePublicInvoice } from "@/hooks/use-public-invoice"
import { CheckoutButton } from "./checkout-button"

export default function PaymentPage() {
  const params = useParams<{ token: string }>()

  const token = params.token

  const { data: invoice, isLoading, isPending, isError, error } = usePublicInvoice(token)

  if (isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30 px-6">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading invoice...
        </div>
      </main>
    )
  }

  if (isError || !invoice) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30 px-6">
        <div className="w-full max-w-md rounded-2xl border bg-background p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
            <CheckCircle2 className="h-6 w-6 text-red-500" />
          </div>

          <h1 className="text-xl font-semibold">Invoice unavailable</h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "This invoice could not be found."}
          </p>
        </div>
      </main>
    )
  }

  const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: invoice.currency,
  })

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(value))

  const isPaid = invoice.status === "PAID"

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Invoice<span className="text-[#2EAFB4]">Flow</span>
          </Link>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4" />
            Secure payment
          </div>
        </div>

        {/* Invoice */}
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-2xl border bg-background shadow-sm">
            <div className="border-b p-6 sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Invoice</p>

                  <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                    {invoice.invoiceNumber}
                  </h1>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-sm text-muted-foreground">Due</p>

                  <p className="mt-1 font-medium">
                    {formatDate(invoice.dueDate)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 border-b p-6 sm:grid-cols-2 sm:p-8">
              <div>
                <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                  Bill to
                </p>

                <p className="mt-2 font-medium">{invoice.customer.name}</p>

                <p className="mt-1 text-sm text-muted-foreground">
                  {invoice.customer.email}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                  Payment terms
                </p>

                <p className="mt-2 font-medium">
                  {invoice.paymentTerm === "Due-on-receipt"
                    ? "Due on receipt"
                    : invoice.paymentTerm || "Due on receipt"}
                </p>
              </div>
            </div>

            {/* Items */}
            <div className="p-6 sm:p-8">
              <h2 className="font-semibold">Invoice items</h2>

              <div className="mt-6 divide-y">
                {invoice.items.map((item) => (
                  <div key={item.id} className="flex gap-4 py-4">
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-col font-medium">
                        {item.name}
                        <span className="text-sm font-light text-muted-foreground">
                          {item.description}
                        </span>
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.quantity} × {formatter.format(item.price)}
                      </p>
                    </div>

                    <p className="font-medium tabular-nums">
                      {formatter.format(item.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Payment summary */}
          <aside className="h-fit rounded-2xl border bg-background p-6 shadow-sm lg:sticky lg:top-6">
            <p className="text-sm text-muted-foreground">Amount due</p>

            <p className="mt-2 text-3xl font-semibold tracking-tight">
              {formatter.format(invoice.total)}
            </p>

            <div className="my-6 space-y-3 border-y py-5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>

                <span>{formatter.format(invoice.subtotal)}</span>
              </div>

              {invoice.discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>

                  <span className="text-green-600">
                    −{formatter.format(invoice.discountAmount)}
                  </span>
                </div>
              )}

              {invoice.tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>

                  <span>{formatter.format(invoice.tax)}</span>
                </div>
              )}
            </div>

            {isPaid ? (
              <div className="rounded-xl bg-emerald-500/10 p-4 text-center">
                <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-600" />

                <p className="mt-2 font-medium text-emerald-700">
                  Invoice paid
                </p>

                <p className="mt-1 text-sm text-emerald-600">
                  Thank you for your payment.
                </p>
              </div>
            ) : (
              <CheckoutButton
                invoice={invoice}
                invoiceId={invoice.id}
                businessCountry={invoice.businessProfile?.businessCountry || "NG"}
                customerCountry={invoice.customer?.customerCountry || "NG"}
              />
              // <Button
              //   className="h-12 w-full bg-[#2EAFB4] text-white hover:bg-[#269ba0]"
              //   size="lg"
              // >
              //   Pay {formatter.format(invoice.total)}
              // </Button>
            )}

            <p className="mt-4 text-center text-xs text-muted-foreground">
              <ShieldCheck className="mr-1 inline h-3.5 w-3.5" />
              Your payment information is securely processed.
            </p>
          </aside>
        </div>
      </div>
    </main>
  )
}
