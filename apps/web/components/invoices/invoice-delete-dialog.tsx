"use client"

import { useDeleteInvoice } from "@/hooks/use-delete-invoice"
import { Invoice } from "@/hooks/use-invoice"
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
import { toast } from "@workspace/ui/components/toast"
import { useRouter } from "next/navigation"

interface InvoiceDeleteDialogProps {
  invoice: Invoice
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted?: () => void
}

export function InvoiceDeleteDialog({
  invoice,
  open,
  onOpenChange,
  onDeleted,
}: InvoiceDeleteDialogProps) {
  const deleteInvoiceMutation = useDeleteInvoice()

  async function handleDelete() {
    deleteInvoiceMutation.mutate(
      {
        invoiceId: invoice.id,
      },
      {
        onSuccess: () => {
          onOpenChange(false)
          onDeleted?.()
          toast.add({
            title: "Invoice deleted",
            description: `${invoice.invoiceNumber} has been deleted.`,
            type: "success",
          })

        },

        onError: (error) => {
          onOpenChange(false)
          toast.add({
            title: "Unable to delete invoice",
            description:
              error instanceof Error
                ? error.message
                : "Something went wrong while deleting the invoice.",
            type: "error",
          })
        },
      }
    )

  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete invoice?</DialogTitle>

          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">
              {invoice?.invoiceNumber}
            </span>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose
            render={
              <Button
                variant="outline"
                disabled={deleteInvoiceMutation.isPending}
              />
            }
          >
            Cancel
          </DialogClose>

          <Button
            variant="destructive"
            disabled={deleteInvoiceMutation.isPending}
            onClick={handleDelete}
          >
            {deleteInvoiceMutation.isPending ? "Deleting..." : "Delete invoice"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
