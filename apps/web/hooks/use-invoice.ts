"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"

export type InvoiceStatus =
  | "Sent"
  | "Paid"
  | "Overdue"
  | "Draft"
  | "Cancelled"

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

  if (status) {
    params.set("status", status)
  }

  const response = await fetch(
    `/api/dashboard/invoices?${params.toString()}`,
    {
      method: "GET",
      credentials: "include",
    }
  )

  if (!response.ok) {
    const error = await response.json().catch(() => null)

    throw new Error(
      error?.error ||
        "Failed to fetch invoices"
    )
  }

  return response.json()
}

export function useInvoices(
  params: UseInvoicesParams = {}
) {
  const {
    page = 1,
    pageSize = 10,
    search = "",
    status,
  } = params

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
  })
}


// "use client"

// import * as React from "react"

// import {
//   getInvoices,
//   INVOICE_STORAGE_EVENT,
// } from "@/components/invoices/invoice-storage"

// import type { Invoice } from "@/components/invoices/invoice-data"

// export function useInvoices() {
//   const [invoices, setInvoices] =
//     React.useState<Invoice[]>([])

//   const refresh = React.useCallback(() => {
//     setInvoices(getInvoices())
//   }, [])

//   React.useEffect(() => {
//     // eslint-disable-next-line react-hooks/set-state-in-effect
//     refresh()

//     window.addEventListener(
//       INVOICE_STORAGE_EVENT,
//       refresh
//     )

//     return () => {
//       window.removeEventListener(
//         INVOICE_STORAGE_EVENT,
//         refresh
//       )
//     }
//   }, [refresh])

//   return {
//     invoices,
//     refresh,
//   }
// }