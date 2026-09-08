"use client"

import { useMutation } from "@tanstack/react-query"
import { toast } from "@workspace/ui/components/toast"

interface ManageSubscriptionResponse {
  url: string
}

async function createManageSubscriptionLink(): Promise<ManageSubscriptionResponse> {
  const response = await fetch(
    "/api/billing/manage",
    {
      method: "POST",
    },
  )

  const result = await response.json()

  if (!response.ok) {
    throw new Error(
      result.error ||
        "Unable to open subscription management.",
    )
  }

  return result
}

export function useManageSubscription() {
  return useMutation({
    mutationFn: createManageSubscriptionLink,

    onSuccess: ({ url }) => {
      window.location.href = url
    },

    onError: (error) => {
      toast.add({
        title: "Unable to manage subscription",
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
        type: "error",
      })
    },
  })
}