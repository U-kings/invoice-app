"use client"

import * as React from "react"

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

import { cancelInvoice } from "./invoice-storage"

interface InvoiceCancelDialogProps {
  invoiceId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InvoiceCancelDialog({
  invoiceId,
  open,
  onOpenChange,
}: InvoiceCancelDialogProps) {
  const [isCancelling, setIsCancelling] = React.useState(false)

  async function handleCancel() {
    setIsCancelling(true)

    try {
      const invoice = cancelInvoice(invoiceId)

      if (!invoice) {
        console.error("Invoice not found:", invoiceId)
        return
      }

      const updatedInvoice = cancelInvoice(invoice.id)

      if (!updatedInvoice) {
        return
      }

      // We'll connect this to the page state next
      console.log("Invoice cancelled:", updatedInvoice)

      onOpenChange(false)
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel invoice?</DialogTitle>

          <DialogDescription>
            This will mark the invoice as cancelled. You won&apos;t be able to
            mark a cancelled invoice as paid.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose
            render={<Button variant="outline" disabled={isCancelling} />}
          >
            Keep invoice
          </DialogClose>

          <Button
            variant="destructive"
            disabled={isCancelling}
            onClick={handleCancel}
          >
            {isCancelling ? "Cancelling..." : "Yes, cancel invoice"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
