"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "@workspace/ui/components/toast"
import { useRouter } from "next/navigation"

import { Invoice } from "./use-invoice"

export interface CreateInvoicePayload {
  customerId: string
  currency: string
  issueDate: string
  dueDate: string
  paymentTerm?: string
  discount?: number
  taxRate?: number
  notes?: string
  send?: boolean
  items: {
    name: string
    description: string
    quantity: number
    rate: number
  }[]
}

interface CreateInvoiceErrorOptions {
  code?: string
  usage?: {
    count: number
    limit: number
  }
}

export class CreateInvoiceError extends Error {
  code?: string
  usage?: {
    count: number
    limit: number
  }

  constructor(
    message: string,
    options?: CreateInvoiceErrorOptions
  ) {
    super(message)
    this.name = "CreateInvoiceError"
    this.code = options?.code
    this.usage = options?.usage
  }
}

export async function createInvoice(
  data: CreateInvoicePayload
): Promise<Invoice> {
  const response = await fetch(
    "/api/dashboard/invoices",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  )

  const result = await response.json()

  if (!response.ok) {
    throw new CreateInvoiceError(
      result.error ||
        "Failed to create invoice",
      {
        code: result.code,
        usage: result.usage,
      }
    )
  }

  return result.invoice
}

export function useCreateInvoice() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (
      data: CreateInvoicePayload
    ) => createInvoice(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["invoices"],
      })

      queryClient.invalidateQueries({
        queryKey: ["invoice-usage"],
      })

      toast.add({
        title: "Invoice created",
        description:
          "Your invoice was created successfully.",
        type: "success",
      })

      router.push("/dashboard/invoices")
    },

    onError: (error) => {
      if (
        error instanceof CreateInvoiceError &&
        error.code ===
          "FREE_INVOICE_LIMIT_REACHED"
      ) {
        const count =
          error.usage?.count ?? 5

        const limit =
          error.usage?.limit ?? 5

        toast.add({
          title: "Free invoice limit reached",
          description: `${count} of ${limit} monthly invoices used. Upgrade to Pro for unlimited invoices.`,
          type: "error",
        })

        queryClient.invalidateQueries({
          queryKey: ["invoice-usage"],
        })

        return
      }

      toast.add({
        title: "Failed to create invoice",
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
        type: "error",
      })
    },
  })
}