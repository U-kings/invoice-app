"use client"

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"

interface DeleteCustomerPayload {
  customerId: string
}

async function deleteCustomer({
  customerId,
}: DeleteCustomerPayload) {
  const response = await fetch(
    `/api/dashboard/customers/${customerId}`,
    {
      method: "DELETE",
    }
  )

  const result = await response.json()

  if (!response.ok) {
    throw new Error(
      result.error || "Failed to delete customer"
    )
  }

  return result
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteCustomer,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["customers"],
      })
    },
  })
}