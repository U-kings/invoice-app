import Link from "next/link"

import { ArrowLeft } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

import { InvoiceForm } from "@/components/invoices/invoice-form"

export default function NewInvoicePage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <Link
          href="/dashboard/invoices"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to invoices
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Create a new invoice
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Create and send an invoice to your customer.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              nativeButton={false}
              render={
                <Link href="/dashboard/invoices" />
              }
            >
              Cancel
            </Button>

            <Button type="submit" form="invoice-form">
              Save invoice
            </Button>
          </div>
        </div>
      </div>

      <InvoiceForm />
    </div>
  )
}