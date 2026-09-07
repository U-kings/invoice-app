"use client"

import { useMutation } from "@tanstack/react-query"

import { toast } from "@workspace/ui/components/toast"

interface CheckoutResponse {
  url: string
}

async function createCheckout(): Promise<CheckoutResponse> {
  const response = await fetch("/api/dashboard/billing/checkout", {
    method: "POST",
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(
      result.error || "Unable to start checkout",
    )
  }

  return result
}

export function useCreateCheckout() {
  return useMutation({
    mutationFn: createCheckout,

    onSuccess: ({ url }) => {
      window.location.href = url
    },

    onError: (error) => {
      toast.add({
        title: "Unable to start checkout",
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
        type: "error",
      })
    },
  })
}