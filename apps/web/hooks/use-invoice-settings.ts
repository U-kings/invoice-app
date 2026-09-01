"use client"

import { useQuery } from "@tanstack/react-query"

interface InvoiceSettings {
  id: string
  userId: string
  invoiceNumberPrefix: string
  nextInvoiceNumber: number
  defaultCurrency: string
  defaultPaymentTerm: string
  defaultTaxRate: number | string
  defaultDiscount: number | string
  defaultNotes: string | null
  createdAt: string
  updatedAt: string
}

interface InvoiceSettingsResponse {
  invoiceSettings: InvoiceSettings | null
}

export function useInvoiceSettings() {
  return useQuery<InvoiceSettingsResponse>({
    queryKey: ["invoice-settings"],
    queryFn: async () => {
      const response = await fetch(
        "/api/dashboard/settings/invoices",
        {
          method: "GET",
          credentials: "include",
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to fetch invoice settings"
        )
      }

      return data
    },
  })
}