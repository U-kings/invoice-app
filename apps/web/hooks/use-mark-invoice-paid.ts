"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { toast } from "@workspace/ui/components/toast"
import { Invoice } from "./use-invoice"

async function markInvoicePaid(invoiceId: string | undefined): Promise<Invoice> {
  const response = await fetch(`/api/dashboard/invoices/${invoiceId}/pay`, {
    method: "POST",
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || "Failed to mark invoice as paid")
  }

  return result.invoice
}

export function useMarkInvoicePaid() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markInvoicePaid,

    onSuccess: (invoice) => {
      // Update the individual invoice immediately.
      queryClient.setQueryData(["invoice", invoice.id], invoice)

      // Refresh invoice lists/dashboard totals.
      queryClient.invalidateQueries({
        queryKey: ["invoices"],
      })
      toast.add({
        title: "Invoice marked as paid",
        description: `${invoice.invoiceNumber} has been marked as paid.`,
        type: "success",
      })
    },
    // onError: (error) => {
    //   toast.add({
    //     title: "Failed to mark invoice as paid",
    //     description:
    //       error instanceof Error ? error.message : "Something went wrong.",
    //     type: "error",
    //   })
    // },
  })
}
