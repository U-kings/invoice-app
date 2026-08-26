"use client"

import { useDeleteCustomer } from "@/hooks/use-delete-customer"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"

import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/toast"
import { Customer } from "@/hooks/use-create-customer"

interface DeleteCustomerDialogProps {
  customer: Customer
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteCustomerDialog({
  customer,
  open,
  onOpenChange,
}: DeleteCustomerDialogProps) {
  const deleteCustomerMutation = useDeleteCustomer()

  function handleDelete() {
    deleteCustomerMutation.mutate(
      {
        customerId: customer.id,
      },
      {
        onSuccess: () => {
          onOpenChange(false)
          toast.add({
            title: "Customer archived",
            description: `${customer.name} has been archived.`,
            type: "success",
          })
        },

        onError: (error) => {
          onOpenChange(false)
          // We'll connect your Base UI toast here.
          toast.add({
            title: "Unable to archive customer",
            description:
              error instanceof Error
                ? error.message
                : "Something went wrong while archiving the customer.",
            type: "error",
          })
        },
      }
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (deleteCustomerMutation.isPending) {
          return
        }

        onOpenChange(nextOpen)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete customer?</DialogTitle>

          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">{customer.name}</span>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={deleteCustomerMutation.isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="destructive"
            disabled={deleteCustomerMutation.isPending}
            onClick={handleDelete}
          >
            {deleteCustomerMutation.isPending
              ? "Deleting..."
              : "Delete customer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
