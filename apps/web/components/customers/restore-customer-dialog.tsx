"use client"

import { useRestoreCustomer } from "@/hooks/use-restore-customer" // Adjust to your actual hook path

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

interface RestoreCustomerDialogProps {
  customer: Customer
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RestoreCustomerDialog({
  customer,
  open,
  onOpenChange,
}: RestoreCustomerDialogProps) {
  const restoreCustomerMutation = useRestoreCustomer()

  function handleRestore() {
    restoreCustomerMutation.mutate(
      {
        customerId: customer.id,
      },
      {
        onSuccess: () => {
          onOpenChange(false)
          toast.add({
            title: "Customer restored",
            description: `${customer.name} has been activated.`,
            type: "success",
          })
        },

        onError: (error) => {
          onOpenChange(false)
          toast.add({
            title: "Unable to restore customer",
            description:
              error instanceof Error
                ? error.message
                : "Something went wrong while restoring the customer.",
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
        // Prevent closing the modal via clicking outside or Esc key while the request is running
        if (restoreCustomerMutation.isPending) {
          return
        }
        onOpenChange(nextOpen)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Restore customer?</DialogTitle>

          <DialogDescription>
            Are you sure you want to restore{" "}
            <span className="font-medium text-foreground">{customer.name}</span>
            ? This will make them active again and available for new invoices.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={restoreCustomerMutation.isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="default" // Using default or your primary theme color instead of destructive
            disabled={restoreCustomerMutation.isPending}
            onClick={handleRestore}
          >
            {restoreCustomerMutation.isPending
              ? "Restoring..."
              : "Restore customer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
