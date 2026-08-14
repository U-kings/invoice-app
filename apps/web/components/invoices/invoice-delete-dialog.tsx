"use client"

import * as React from "react"
import { Trash2 } from "lucide-react"

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

interface InvoiceDeleteDialogProps {
  invoiceId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InvoiceDeleteDialog({
  invoiceId,
  open,
  onOpenChange,
}: InvoiceDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [deleteOpen, setDeleteOpen] =
  React.useState(false)

  async function handleDelete() {
    setIsDeleting(true)

    try {
      // Replace this with your API call later.
      await new Promise((resolve) => setTimeout(resolve, 800))

      console.log("Invoice deleted:", invoiceId)
      onOpenChange(false)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive"
          />
        }
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete invoice
      </DialogTrigger>

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
