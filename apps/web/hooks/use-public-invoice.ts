"use client"

import { useQuery } from "@tanstack/react-query"

export interface PublicInvoice {
  id: string
  invoiceNumber: string
  status: string
  currency: string
  issueDate: string
  dueDate: string
  paymentTerm: string | null
  notes: string | null

  customer: {
    name: string
    email: string
  }

  items: {
    id: string
    description: string
    quantity: number
    price: number
    amount: number
  }[]

  subtotal: number
  discountRate: number
  discountAmount: number
  taxRate: number
  tax: number
  total: number
}

async function fetchPublicInvoice(
  token: string
): Promise<PublicInvoice> {
  const response = await fetch(
    `/api/dashboard/invoices/pay/${token}`
  )

  const result = await response.json()

  if (!response.ok) {
    throw new Error(
      result.error || "Failed to load invoice"
    )
  }

  return result.invoice
}

export function usePublicInvoice(token: string) {
  return useQuery({
    queryKey: ["public-invoice", token],
    queryFn: () => fetchPublicInvoice(token),
    enabled: Boolean(token),
  })
}