"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

export interface CustomerCurrencyTotal {
  currency: string
  total: number
}

export type CustomerStatus = "active" | "archived" | "blocked"

export interface CustomerListItem {
  id: string
  name: string
  email: string
  phone: string
  address: string
  status: CustomerStatus
  createdAt: string
  invoiceCount: number
  totalsByCurrency: Record<string, number>
}

export interface CustomersResponse {
  customers: CustomerListItem[]

  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

interface UseCustomersOptions {
  page?: number
  pageSize?: number
  search?: string
  status?: CustomerStatus
}

async function fetchCustomers({
  // page,
  // pageSize,
  // search,
  // status
  page = 1,
  pageSize = 10,
  search = "",
  status,
}: UseCustomersOptions): Promise<CustomersResponse> {
  const params = new URLSearchParams()

  params.set("page", String(page))
  params.set("pageSize", String(pageSize))

  if (search.trim()) {
    params.set("search", search.trim())
  }

  if (status) {
    params.set("status", status)
  }

  const response = await fetch(`/api/dashboard/customers?${params.toString()}`)

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || "Failed to fetch customers")
  }

  return result as CustomersResponse
}

export function useCustomers({
  page = 1,
  pageSize = 10,
  search = "",
  status,
}: UseCustomersOptions = {}) {
  return useQuery({
    queryKey: [
      "customers",
      {
        page,
        pageSize,
        search,
        status,
      },
    ],

    queryFn: () =>
      fetchCustomers({
        page,
        pageSize,
        search,
        status,
      }),

    // placeholderData: (previousData) => previousData,
    placeholderData: keepPreviousData,

    staleTime: 0, // Treats old data as instantly expired
    gcTime: 0, // (Or cacheTime: 0 in older versions) Wipes cache instantly on page leave
  })
}
