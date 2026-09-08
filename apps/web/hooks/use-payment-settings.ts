"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { toast } from "@workspace/ui/components/toast"

export interface PaymentSettings {
  id: string
  userId: string

  paystackEnabled: boolean
  stripeEnabled: boolean
  flutterwaveEnabled: boolean

  cardPayments: boolean
  bankTransfer: boolean
  cashPayments: boolean

  onlinePayments: boolean
  paymentLinks: boolean
  partialPayments: boolean
  automaticPaymentConfirmation: boolean

  bankName: string | null
  bankCode: string | null
  accountName: string | null
  accountNumber: string | null
  additionalInformation: string | null

  createdAt: string
  updatedAt: string
}

export type UpdatePaymentSettingsInput = Partial<
  Omit<PaymentSettings, "id" | "userId" | "createdAt" | "updatedAt">
>

async function fetchPaymentSettings(): Promise<PaymentSettings> {
  const response = await fetch("/api/dashboard/settings/payments", {
    credentials: "include",
  })

  if (!response.ok) {
    const data = await response.json().catch(() => null)

    throw new Error(data?.error || "Failed to fetch payment settings")
  }

  return response.json()
}

async function updatePaymentSettings(
  values: UpdatePaymentSettingsInput
): Promise<PaymentSettings> {
  const response = await fetch("/api/dashboard/settings/payments", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(values),
  })

  if (!response.ok) {
    const data = await response.json().catch(() => null)

    throw new Error(data?.error || "Failed to update payment settings")
  }

  return response.json()
}

export function usePaymentSettings() {
  return useQuery({
    queryKey: ["payment-settings"],
    queryFn: fetchPaymentSettings,
  })
}

export function useUpdatePaymentSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updatePaymentSettings,

    onSuccess: (data) => {
      queryClient.setQueryData(["payment-settings"], data)

      toast.add({
        type: "success",
        title: "Success",
        description: "Payment settings saved successfully.",
      })
    },

    onError: (error) => {
      toast.add({
        type: "error",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update payment settings.",
      })
    },
  })
}
