"use client"

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"

interface RestoreCustomerPayload {
  customerId: string
}

async function restoreCustomer({
  customerId,
}: RestoreCustomerPayload) {
  // Matches your route structure: /api/dashboard/customers/[id]/restore
  const response = await fetch(
    `/api/dashboard/customers/${customerId}/restore`,
    {
      method: "PATCH",
    }
  )

  const result = await response.json()

  if (!response.ok) {
    throw new Error(
      result.error || "Failed to restore customer"
    )
  }

  return result
}

export function useRestoreCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: restoreCustomer,

    onSuccess: () => {
      // Refresh the customer query to move them back into active views
      queryClient.invalidateQueries({
        queryKey: ["customers"],
      })
    },
  })
}
