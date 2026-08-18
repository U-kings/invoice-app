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
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { deleteInvoice, INVOICE_STORAGE_EVENT } from "./invoice-storage"
import { useRouter } from "next/navigation"

interface InvoiceDeleteDialogProps {
  invoiceId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted?: () => void
}

export function InvoiceDeleteDialog({
  invoiceId,
  open,
  onOpenChange,
  onDeleted,
}: InvoiceDeleteDialogProps) {
  // const router = useRouter()
  const [isDeleting, setIsDeleting] = React.useState(false)

  async function handleDelete() {
    setIsDeleting(true)

    try {
      deleteInvoice(invoiceId)
      window.dispatchEvent(new Event(INVOICE_STORAGE_EVENT))

      onOpenChange(false)

      onDeleted?.()

      // router.push("/dashboard/invoices")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete invoice?</DialogTitle>

          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">{invoiceId}</span>?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose
            render={<Button variant="outline" disabled={isDeleting} />}
          >
            Cancel
          </DialogClose>

          <Button
            variant="destructive"
            disabled={isDeleting}
            onClick={handleDelete}
          >
            {isDeleting ? "Deleting..." : "Delete invoice"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
