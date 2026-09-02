"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export interface Profile {
  id: string
  firstName: string
  middleName: string | null
  lastName: string
  email: string
  phoneNumber: string | null
  profileImageUrl: string | null
}

async function fetchProfile(): Promise<Profile> {
  const response = await fetch("/api/dashboard/settings/profile")

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || "Failed to fetch profile")
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

async function updateProfile(data: UpdateProfilePayload): Promise<Profile> {
  const response = await fetch("/api/dashboard/settings/profile", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || "Failed to update profile")
  }

  return result.user
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateProfile,

    onSuccess: (user) => {
      queryClient.setQueryData(["settings", "profile"], user)
    },
  })
}

async function uploadProfileImage(file: File) {
  const formData = new FormData()

  formData.append("file", file)

  const response = await fetch("/api/dashboard/settings/profile/image", {
    method: "POST",
    body: formData,
  })

  const body = await response.json()

  if (!response.ok) {
    throw new Error(body?.error || "Failed to upload profile image.")
  }

  return body as {
    success: true
    profileImageUrl: string
  }
}

export function useUploadProfileImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: uploadProfileImage,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["profile"],
      })
    },
  })
}

async function removeProfileImage() {
  const response = await fetch("/api/dashboard/settings/profile/image", {
    method: "DELETE",
  })

  const body = await response.json()

  if (!response.ok) {
    throw new Error(body?.error || "Failed to remove profile image.")
  }

  return body as {
    success: true
  }
}

export function useRemoveProfileImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: removeProfileImage,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["profile"],
      })
    },
  })
}
