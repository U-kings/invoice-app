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

// import { cancelInvoice } from "./invoice-storage"
import { useCancelInvoice } from "@/hooks/use-cancel-invoice"
import { Invoice } from "@/hooks/use-invoice"

interface InvoiceCancelDialogProps {
  invoice: Invoice | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InvoiceCancelDialog({
  invoice,
  open,
  onOpenChange,
}: InvoiceCancelDialogProps) {
  const cancelInvoiceMutation = useCancelInvoice()

  async function handleCancel() {
    cancelInvoiceMutation.mutate(invoice?.id, {
      onSuccess: () => {
        onOpenChange(false)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel invoice?</DialogTitle>

          <DialogDescription>
            Are you sure you want to cancel{" "}
            <span className="font-medium text-foreground">
              {invoice?.invoiceNumber}
            </span>
            ? This will mark the invoice as cancelled. You won&apos;t be able to
            mark a cancelled invoice as paid.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose
            render={
              <Button
                variant="outline"
                disabled={cancelInvoiceMutation.isPending}
              />
            }
          >
            Keep invoice
          </DialogClose>

          <Button
            variant="destructive"
            disabled={cancelInvoiceMutation.isPending}
            onClick={handleCancel}
          >
            {cancelInvoiceMutation.isPending
              ? "Cancelling..."
              : "Yes, cancel invoice"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
