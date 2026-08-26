"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

export interface CreateCustomerPayload {
  name: string
  email: string
}

export interface Customer {
  id: string
  name: string
  email: string
  createdAt: string
}

async function createCustomer(
  data: CreateCustomerPayload
): Promise<Customer> {
  const response = await fetch("/api/dashboard/customers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(
      result.error || "Failed to create customer"
    )
  }

  return result.customer
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCustomer,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["customers"],
      })
    },
  })
}