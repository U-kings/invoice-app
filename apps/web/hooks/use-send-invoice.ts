"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import type { Invoice } from "@/components/invoices/invoice-data"
import { toast } from "@workspace/ui/components/toast"

export async function sendInvoice(invoiceId: string): Promise<Invoice> {
  const response = await fetch(`/api/dashboard/invoices/${invoiceId}/send`, {
    method: "POST",
  })

  const result = await response.json()

  if (!response.ok) {
    // toast.add({
    //   title: "Failed",
    //   description: (result.error || "Failed to create invoice") as string,
    //   type: "error",
    // })
    throw new Error(result.error || "Failed to send invoice")
  }

  return result.invoice
}

export function useSendInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (invoiceId: string) => sendInvoice(invoiceId),

    onSuccess: (invoice) => {
      toast.add({
        title: "Success",
        description: "Invoice successfully created" as string,
        type: "success",
      })

      queryClient.invalidateQueries({
        queryKey: ["invoices"],
      })

      queryClient.setQueryData(["invoice", invoice.id], invoice)
    },
  })
}
