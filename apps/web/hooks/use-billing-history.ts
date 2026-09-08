"use client"

import { useQuery } from "@tanstack/react-query"

export type BillingTransactionStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "REFUNDED"

export interface BillingTransaction {
  id: string
  provider: string
  providerTransactionId: string | null
  providerReference: string | null
  amount: string
  currency: string
  status: BillingTransactionStatus
  description: string | null
  paidAt: string | null
  createdAt: string
}

export interface BillingHistoryResponse {
  transactions: BillingTransaction[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

async function fetchBillingHistory(): Promise<BillingHistoryResponse> {
  const response = await fetch(
    "/api/dashboard/billing/history",
  )

  const result = await response.json()

  if (!response.ok) {
    throw new Error(
      result.error || "Failed to fetch billing history",
    )
  }

  return result
}

export function useBillingHistory() {
  return useQuery({
    queryKey: ["billing-history"],
    queryFn: fetchBillingHistory,
  })
}