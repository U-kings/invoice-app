"use client"

import { useQuery } from "@tanstack/react-query"

export interface DashboardStats {
  currency: string

  totalRevenue: number
  currentMonthRevenue: number
  previousMonthRevenue: number
  revenueChange: number

  outstanding: number
  overdue: number

  totalInvoices: number
  paidInvoices: number
  currentMonthInvoices: number
  previousMonthInvoices: number
  invoiceChange: number

  totalCustomers: number
  currentMonthCustomers: number
  previousMonthCustomers: number
  customerChange: number
}

export interface DashboardRevenuePoint {
  month: string
  revenue: number
}

export interface DashboardInvoiceTrendPoint {
  month: string
  count: number
}

export interface DashboardCustomerTrendPoint {
  month: string
  count: number
}

export interface DashboardOutstandingTrendPoint {
  month: string
  amount: number
}

export interface DashboardData {
  currency: string

  availableCurrencies: string[]

  stats: DashboardStats

  revenue: {
    period: string
    currency: string
    data: DashboardRevenuePoint[]
  }

  invoiceTrend: {
    period: string
    currency: string
    data: DashboardInvoiceTrendPoint[]
  }

  customerTrend: {
    period: string
    data: DashboardCustomerTrendPoint[]
  }

  outstandingTrend: {
    period: string
    currency: string
    data: DashboardOutstandingTrendPoint[]
  }

  recentInvoices: Array<{
    id: string
    invoiceNumber: string
    lineItems: Array<{
      id: string
      name: string
      quantity: number
      rate: number
    }>
    discount: number
    taxRate: number
    customer: {
      id: string
      name: string
      email: string
    }
    status: string
    currency: string
    issueDate: string
    dueDate: string
    total: number
    createdAt: string
  }>

  invoiceStatus: {
    draft: number
    sent: number
    paid: number
    overdue: number
    cancelled: number
  }

  recentPayments: Array<{
    id: string
    amount: number
    currency: string
    status: string
    provider: string
    createdAt: string
    invoice: {
      id: string
      invoiceNumber: string
      customer: {
        id: string
        name: string
      }
    }
  }>

  upcomingInvoices: Array<{
    id: string
    invoiceNumber: string
    customer: {
      id: string
      name: string
    }
    currency: string
    dueDate: string
    status: string
    total: number
  }>

  activity: Array<{
    id: string
    type: string
    title: string
    description: string
    date: string
    entityId: string
  }>
}

export function useDashboard(
  currency?: string,
  period: "month" | "6months" | "year" = "6months"
) {
  return useQuery<DashboardData>({
    queryKey: ["dashboard", currency ?? "default", period],

    queryFn: async () => {
      const params = new URLSearchParams()

      if (currency) {
        params.set("currency", currency)
      }

      params.set("period", period)

      const response = await fetch(
        `/api/dashboard/overview?${params.toString()}`
      )
      if (!response.ok) {
        const data = await response.json().catch(() => null)

        throw new Error(data?.error || "Failed to load dashboard data")
      }

      return response.json()
    },
  })
}
