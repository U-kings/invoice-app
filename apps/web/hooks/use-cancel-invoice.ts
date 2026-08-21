"use client"

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"

import { toast } from "@workspace/ui/components/toast"
import { Invoice } from "./use-invoice"

async function cancelInvoice(
  id: string |undefined
): Promise<Invoice> {
  const response = await fetch(
    `/api/invoices/${id}/cancel`,
    {
      method: "POST",
    }
  )

  const result = await response.json()

  if (!response.ok) {
    throw new Error(
      result.error ||
        "Failed to cancel invoice"
    )
  }

  return result.invoice
}

export function useCancelInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: cancelInvoice,

    onSuccess: (invoice) => {
      // 1. Update the invoice detail cache immediately.
      queryClient.setQueryData<Invoice>(
        ["invoice", invoice.id],
        invoice
      )

      // 2. Update every cached invoice list immediately.
      queryClient.setQueriesData<Invoice[]>(
        {
          queryKey: ["invoices"],
        },
        (invoices) => {
          if (!invoices) return invoices

          return invoices.map((item) =>
            item.id === invoice.id
              ? invoice
              : item
          )
        }
      )

      // 3. Refresh server-derived data in the background.
      queryClient.invalidateQueries({
        queryKey: ["invoices"],
      })

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      })

      toast.add({
        title: "Invoice cancelled",
        description: `${invoice.invoiceNumber} has been cancelled.`,
        type: "success",
      })
    },

    onError: (error) => {
      toast.add({
        title: "Failed to cancel invoice",
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong.",
        type: "error",
      })
    },
  })
}