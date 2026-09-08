"use client"

import { useQuery } from "@tanstack/react-query"

export interface InvoiceUsage {
  count: number | null
  limit: number | null
  remaining: number | null
  percentage: number
}

export interface InvoiceUsageResponse {
  plan: "FREE" | "PRO"
  isPro: boolean
  usage: InvoiceUsage
}

async function fetchInvoiceUsage(): Promise<InvoiceUsageResponse> {
  const response = await fetch(
    "/api/dashboard/billing/usage"
  )

  const result = await response.json()

  if (!response.ok) {
    throw new Error(
      result.error ||
        "Unable to load invoice usage."
    )
  }

  return result
}

export function useInvoiceUsage() {
  return useQuery({
    queryKey: ["invoice-usage"],
    queryFn: fetchInvoiceUsage,
  })
}