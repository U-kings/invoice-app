"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { toast } from "@workspace/ui/components/toast"

export type PaymentConnectionStatus =
  "PENDING" | "CONNECTED" | "DISCONNECTED" | "ERROR"

export type PaymentProvider = "PAYSTACK" | "STRIPE" | "PAYPAL"

export interface PaymentProviderConnection {
  id: string
  provider: PaymentProvider
  status: PaymentConnectionStatus
  providerAccountId: string | null
  providerMerchantId: string | null
  createdAt: string
  updatedAt: string
}

async function fetchProviderConnections(): Promise<
  PaymentProviderConnection[]
> {
  const response = await fetch("/api/dashboard/payments/providers", {
    credentials: "include",
  })

  if (!response.ok) {
    const data = await response.json().catch(() => null)

    throw new Error(data?.error || "Failed to fetch payment providers")
  }

  return response.json()
}

async function connectPaystack(secretKey: string) {
  const response = await fetch(
    "/api/dashboard/payments/providers/paystack/connect",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        secretKey,
      }),
    }
  )

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.error || "Failed to connect Paystack")
  }

  return data
}

async function disconnectPaystack() {
  const response = await fetch(
    "/api/dashboard/payments/providers/paystack/disconnect",
    {
      method: "POST",
      credentials: "include",
    }
  )

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.error || "Failed to disconnect Paystack")
  }

  return data
}

export function usePaymentProviderConnections() {
  return useQuery({
    queryKey: ["payment-provider-connections"],
    queryFn: fetchProviderConnections,
  })
}

export function useConnectPaystack() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: connectPaystack,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["payment-provider-connections"],
      })

      toast.add({
        type: "success",
        title: "Success",
        description: "Paystack connected successfully.",
      })
    },

    onError: (error) => {
      toast.add({
        type: "error",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to connect Paystack.",
      })
    },
  })
}

export function useDisconnectPaystack() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: disconnectPaystack,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["payment-provider-connections"],
      })

      toast.add({
        type: "success",
        title: "Success",
        description: "Paystack disconnected successfully.",
      })
    },

    onError: (error) => {
      toast.add({
        type: "error",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to disconnect Paystack.",
      })
    },
  })
}

export function useConnectStripe() {
  return {
    mutate: () => {
      window.location.assign("/api/dashboard/payments/providers/stripe/connect")
    },
    isPending: false,
  }
}

export function useDisconnectStripe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(
        "/api/dashboard/payments/providers/stripe/disconnect",
        {
          method: "POST",
          credentials: "include",
        }
      )

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || "Failed to disconnect Stripe")
      }

      return data
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["payment-provider-connections"],
      })

      toast.add({
        type: "success",
        title: "Success",
        description: "Stripe disconnected successfully.",
      })
    },

    onError: (error) => {
      toast.add({
        type: "error",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to disconnect Stripe.",
      })
    },
  })
}
