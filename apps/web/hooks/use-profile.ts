"use client"

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

export interface Profile {
  id: string
  firstName: string
  middleName: string | null
  lastName: string
  email: string
  phoneNumber: string
}

async function fetchProfile(): Promise<Profile> {
  const response = await fetch(
    "/api/dashboard/settings/profile"
  )

  const result = await response.json()

  if (!response.ok) {
    throw new Error(
      result.error || "Failed to fetch profile"
    )
  }

  return result.user
}

export function useProfile() {
  return useQuery({
    queryKey: ["settings", "profile"],
    queryFn: fetchProfile,
  })
}

export interface UpdateProfilePayload {
  firstName: string
  middleName?: string
  lastName: string
  phoneNumber: string
}

async function updateProfile(
  data: UpdateProfilePayload
): Promise<Profile> {
  const response = await fetch(
    "/api/dashboard/settings/profile",
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  )

  const result = await response.json()

  if (!response.ok) {
    throw new Error(
      result.error || "Failed to update profile"
    )
  }

  return result.user
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateProfile,

    onSuccess: (user) => {
      queryClient.setQueryData(
        ["settings", "profile"],
        user
      )
    },
  })
}