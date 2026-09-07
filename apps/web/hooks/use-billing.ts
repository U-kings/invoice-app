"use client"

import { useQuery } from "@tanstack/react-query"

export type SubscriptionPlan = "FREE" | "PRO"

export type SubscriptionStatus =
  | "ACTIVE"
  | "TRIALING"
  | "PAST_DUE"
  | "CANCELLED"
  | "EXPIRED"

export interface BillingSubscription {
  id: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  provider: string | null
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  cancelledAt: string | null
}

export interface BillingResponse {
  subscription: BillingSubscription
}

async function fetchBilling(): Promise<BillingResponse> {
  const response = await fetch(
    "/api/dashboard/billing",
  )

  const result = await response.json()

  if (!response.ok) {
    throw new Error(
      result.error || "Failed to fetch billing information",
    )
  }

  return result
}

export function useBilling() {
  return useQuery({
    queryKey: ["billing"],
    queryFn: fetchBilling,
  })
}