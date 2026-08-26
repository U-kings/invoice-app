"use client"

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"

interface DeleteInvoicePayload {
  invoiceId: string
}

async function deleteInvoice({
  invoiceId,
}: DeleteInvoicePayload) {
  const response = await fetch(
    `/api/dashboard/invoices/${invoiceId}`,
    {
      method: "DELETE",
    }
  )

  const result = await response.json()

  if (!response.ok) {
    throw new Error(
      result.error || "Failed to delete invoice"
    )
  }

  return result
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteInvoice,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["invoices"],
      })
    },
  })
}