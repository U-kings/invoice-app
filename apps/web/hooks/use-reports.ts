"use client"

import { useQuery } from "@tanstack/react-query"

export type ReportPeriod = "7d" | "30d" | "90d" | "12m"

export interface ReportsResponse {
  period: ReportPeriod

  overview: {
    invoiceCount: number
    totalInvoiced: Record<string, number>
    totalPaid: Record<string, number>
    totalOutstanding: Record<string, number>
    totalOverdue: Record<string, number>
  }

  invoiceStatus: {
    status: string
    count: number
  }[]

  revenueTrend: {
    date: string
    currency: string
    amount: number
  }[]

  topCustomers: {
    id: string
    name: string
    email: string
    invoiceCount: number
    totalInvoiced: Record<string, number>
    totalPaid: Record<string, number>
    outstanding: Record<string, number>
  }[]

  outstandingInvoices: {
    id: string
    invoiceNumber: string
    customerName: string
    dueDate: string
    currency: string
    amount: number
    status: string
  }[]
}

async function fetchReports(
  period: ReportPeriod,
): Promise<ReportsResponse> {
  const params = new URLSearchParams({
    period,
  })

  const response = await fetch(
    `/api/dashboard/reports?${params.toString()}`,
  )

  const result = await response.json()

  if (!response.ok) {
    throw new Error(
      result.error || "Failed to fetch reports",
    )
  }

  return result as ReportsResponse
}

export function useReports(
  period: ReportPeriod = "30d",
) {
  return useQuery({
    queryKey: ["reports", period],
    queryFn: () => fetchReports(period),
    placeholderData: previousData => previousData,
  })
}