"use client"

import { useQuery } from "@tanstack/react-query"

export type PaymentStatus =
  "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED" | "CANCELLED" | "EXPIRED"

export interface PaymentListItem {
  id: string
  reference: string
  provider: "STRIPE" | "PAYSTACK" | "FLUTTERWAVE"
  providerReference: string | null
  providerTransactionId: string | null

  amount: string
  currency: string

  status: PaymentStatus

  checkoutUrl: string | null
  paidAt: string | null
  createdAt: string

  invoice: {
    id: string
    invoiceNumber: string

    customer: {
      id: string
      name: string
      email: string
    }
  }
}

export interface PaymentsResponse {
  payments: PaymentListItem[]

  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

interface UsePaymentsOptions {
  page?: number
  pageSize?: number
  search?: string
  status?: PaymentStatus
  provider?: string
  currency?: string
}

async function fetchPayments({
  page,
  pageSize,
  search,
  status,
  provider,
  currency,
}: UsePaymentsOptions): Promise<PaymentsResponse> {
  // }: Required<UsePaymentsOptions>) {
  const params = new URLSearchParams()

  params.set("page", String(page))
  params.set("pageSize", String(pageSize))

  if (search?.trim()) {
    params.set("search", search.trim())
  }

  if (status) {
    params.set("status", status)
  }

  if (provider) {
    params.set("provider", provider)
  }

  if (currency) {
    params.set("currency", currency)
  }

  const response = await fetch(`/api/dashboard/payments?${params.toString()}`)

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || "Failed to fetch payments")
  }

  return result as PaymentsResponse
}

export function usePayments({
  page = 1,
  pageSize = 10,
  search = "",
  status,
  provider = "",
  currency = "",
}: UsePaymentsOptions = {}) {
  return useQuery({
    queryKey: [
      "payments",
      {
        page,
        pageSize,
        search,
        status,
        provider,
        currency,
      },
    ],

    queryFn: () =>
      fetchPayments({
        page,
        pageSize,
        search,
        status,
        provider,
        currency,
      }),

    placeholderData: (previousData) => previousData,
  })
}
