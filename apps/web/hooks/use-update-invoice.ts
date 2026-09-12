"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { toast } from "@workspace/ui/components/toast"
import { useRouter } from "next/navigation"

export interface UpdateInvoiceItem {
  name: string
  description: string
  quantity: number
  rate: number
}

export interface UpdateInvoicePayload {
  customerId?: string
  customerName?: string
  customerEmail?: string
  currency?: string
  issueDate: string
  dueDate: string
  paymentTerm?: string
  discount?: number
  taxRate?: number
  notes?: string
  items: UpdateInvoiceItem[]
}

interface UpdateInvoiceResponse {
  message: string
  invoice: {
    id: string
    status: string
    invoiceNumber: string
  }
  requiresResend: boolean
}

export function useUpdateInvoice(invoiceId: string) {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async (
      payload: UpdateInvoicePayload
    ): Promise<UpdateInvoiceResponse> => {
      const response = await fetch(
        `/api/dashboard/invoices/${invoiceId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to update invoice."
        )
      }

      return data
    },

    onSuccess: (data) => {
      toast.add({
        title: "Invoice updated",
        description: data.requiresResend
          ? "The invoice was updated. Send the updated invoice when you're ready."
          : "The invoice has been updated successfully.",
        type: "success",
      })

      router.push("/dashboard/invoices")

      // Refresh the individual invoice
      queryClient.invalidateQueries({
        queryKey: ["invoice", invoiceId],
      })

      // Refresh invoice lists
      queryClient.invalidateQueries({
        queryKey: ["invoices"],
      })
    },

    onError: (error) => {
      toast.add({
        title: "Failed to update invoice",
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong while updating the invoice.",
        type: "error",
      })
    },
  })
}