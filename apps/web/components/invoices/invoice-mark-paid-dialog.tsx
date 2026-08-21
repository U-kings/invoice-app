"use client"

import * as React from "react"

import { CheckCircle2 } from "lucide-react"

import { Button } from "@workspace/ui/components/button"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"

import { useMarkInvoicePaid } from "@/hooks/use-mark-invoice-paid"
import { getInvoiceTotal } from "@/lib/invoices/invoice"
import { formatCurrency } from "@/lib/currency"
import { Invoice } from "@/hooks/use-invoice"

interface InvoiceMarkPaidDialogProps {
  invoice: Invoice | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InvoiceMarkPaidDialog({
  invoice,
  open,
  onOpenChange,
}: InvoiceMarkPaidDialogProps) {
  const markInvoicePaidMutation = useMarkInvoicePaid()
  const total = getInvoiceTotal(invoice)

  async function handleMarkAsPaid() {
    markInvoicePaidMutation.mutate(invoice?.id)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (markInvoicePaidMutation.isPending) {
          return
        }

        onOpenChange(nextOpen)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>

          <DialogTitle>Mark invoice as paid?</DialogTitle>

          <DialogDescription>
            This will mark{" "}
            <span className="font-medium text-foreground">
              {invoice?.invoiceNumber ?? invoice?.id}
            </span>{" "}
            as paid. This action records the invoice as paid in your account.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-muted-foreground">Invoice</span>

            <span className="font-medium">
              {invoice?.invoiceNumber ?? invoice?.id}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between gap-4 text-sm">
            <span className="text-muted-foreground">Amount</span>

            <span className="font-semibold">
              {/* Use your existing currency formatter here */}
              {formatCurrency(total, invoice?.currency)}
            </span>
          </div>
        </div>

        {markInvoicePaidMutation.isError && (
          <p className="text-sm text-destructive">
            {markInvoicePaidMutation.error.message}
          </p>
        )}

        <DialogFooter>
          <DialogClose
            render={
              <Button
                variant="outline"
                disabled={markInvoicePaidMutation.isPending}
              />
            }
          >
            Cancel
          </DialogClose>

          <Button
            onClick={handleMarkAsPaid}
            disabled={markInvoicePaidMutation.isPending}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {markInvoicePaidMutation.isPending
              ? "Marking as paid..."
              : "Mark as paid"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
