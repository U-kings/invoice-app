"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import type { Invoice } from "@/components/invoices/invoice-data"
import { toast } from "@workspace/ui/components/toast"
import { useRouter } from "next/navigation"

export interface CreateInvoicePayload {
  customerId: string
  currency: string
  issueDate: string
  dueDate: string
  paymentTerm?: string
  discount?: number
  taxRate?: number
  notes?: string
  sent?: boolean
  items: {
    description: string
    quantity: number
    rate: number
  }[]
}

export async function createInvoice(
  data: CreateInvoicePayload
): Promise<Invoice> {
  const response = await fetch("/api/dashboard/invoices", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  const result = await response.json()

  if (!response.ok) {
    toast.add({
      title: "Failed",
      description: (result.error || "Failed to create invoice") as string,
      type: "error",
    })
    throw new Error(result.error || "Failed to create invoice")
  }

  return result.invoice
}

export function useCreateInvoice() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateInvoicePayload) => createInvoice(data),

    onSuccess: () => {
      // Navigate after successful creation
      router.push("/dashboard/invoices")

      queryClient.invalidateQueries({
        queryKey: ["invoices"],
      })
    },
  })
}
