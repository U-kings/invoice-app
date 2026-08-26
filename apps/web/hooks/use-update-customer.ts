"use client"

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"

export interface UpdateCustomerPayload {
  customerId: string
  name: string
  email: string
}

async function updateCustomer({
  customerId,
  name,
  email,
}: UpdateCustomerPayload) {
  const response = await fetch(
    `/api/dashboard/customers/${customerId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
      }),
    }
  )

  const result = await response.json()

  if (!response.ok) {
    throw new Error(
      result.error || "Failed to update customer"
    )
  }

  return result.customer
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateCustomer,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["customers"],
      })
    },
  })
}