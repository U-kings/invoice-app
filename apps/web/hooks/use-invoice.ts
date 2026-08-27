"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

export type InvoiceStatus = "Sent" | "Paid" | "Overdue" | "Draft" | "Cancelled"

export type InvoiceCustomer = {
  id: string
  name: string
  email: string
}

export type InvoiceLineItem = {
  id: string
  invoiceId?: string
  name: string
  description: string
  quantity: number
  rate: number
}

export type Invoice = {
  id: string
  invoiceNumber: string
  userId?: string
  publicToken?: string
  customerId: string
  status: InvoiceStatus
  currency: string
  issueDate: string
  dueDate: string
  paymentTerm: string | null
  discount: number
  taxRate: number
  notes: string | undefined
  sentAt?: string | null
  paidAt?: string | undefined
  cancelledAt?: string | null
  createdAt?: string
  updatedAt?: string
  customer?: InvoiceCustomer
  lineItems: InvoiceLineItem[]
}

export type InvoicePagination = {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export type GetInvoicesResponse = {
  data: Invoice[]
  pagination: InvoicePagination
}

type UseInvoicesParams = {
  page?: number
  pageSize?: number
  search?: string
  status?: InvoiceStatus
}

async function getInvoices({
  page = 1,
  pageSize = 10,
  search = "",
  status,
}: UseInvoicesParams): Promise<GetInvoicesResponse> {
  const params = new URLSearchParams()

  params.set("page", String(page))
  params.set("pageSize", String(pageSize))

  if (search.trim()) {
    params.set("search", search.trim())
  }

  // Ensures we only append status if it's explicitly provided and valid
  if (status) {
    params.set("status", status)
  }

  const response = await fetch(`/api/dashboard/invoices?${params.toString()}`, {
    method: "GET",
    credentials: "include", // Correctly passes HttpOnly auth cookies down
  })

  // 1. Read the JSON body payload IMMEDIATELY, exactly once
  const result = await response.json().catch(() => null)

  // 2. Validate response outcome flags using that memory cache
  if (!response.ok) {
    throw new Error(result?.error || "Failed to fetch invoices")
  }

  // 3. Return the typed body safely without breaking stream pointers
  return result as GetInvoicesResponse
}

export function useInvoices(params: UseInvoicesParams = {}) {
  const { page = 1, pageSize = 10, search = "", status } = params

  return useQuery({
    queryKey: [
      "invoices",
      {
        page,
        pageSize,
        search,
        status,
      },
    ],

    queryFn: () =>
      getInvoices({
        page,
        pageSize,
        search,
        status,
      }),

    placeholderData: keepPreviousData,
    staleTime: 0, // Treats old data as instantly expired
    gcTime: 0, // (Or cacheTime: 0 in older versions) Wipes cache instantly on page leave
  })
}
