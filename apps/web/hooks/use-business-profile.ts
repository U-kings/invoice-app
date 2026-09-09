import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "@workspace/ui/components/toast"

async function uploadBusinessLogo(file: File) {
  const formData = new FormData()

  formData.append("file", file)

  const response = await fetch("/api/dashboard/settings/business/logo", {
    method: "POST",
    body: formData,
  })

  const body = await response.json()

  if (!response.ok) {
    throw new Error(body?.error || "Failed to upload business logo.")
  }

  return body as {
    success: true
    logoUrl: string
  }
}

export function useUploadBusinessLogo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: uploadBusinessLogo,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["business-profile"],
      })
    },
  })
}

async function removeBusinessLogo() {
  const response = await fetch("/api/dashboard/settings/business/logo", {
    method: "DELETE",
  })

  const body = await response.json()

  if (!response.ok) {
    throw new Error(body?.error || "Failed to remove business logo.")
  }

  return body as {
    success: true
  }
}

export function useRemoveBusinessLogo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: removeBusinessLogo,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["business-profile"],
      })
    },
  })
}

export interface BusinessProfileFormValues {
  businessName: string
  countryCode: string
  currency: string
  email: string
  phone?: string
  website?: string
  address?: string
  city?: string
  state?: string
  postalCode?: string
  taxId?: string
}

export interface BusinessProfile {
  id: string
  userId: string
  businessName: string
  countryCode: string
  currency: string
  email: string
  phone: string | null
  website: string | null
  address: string | null
  city: string | null
  state: string | null
  postalCode: string | null
  taxId: string | null
  createdAt: string
  updatedAt: string
}

export function useBusinessProfile() {
  return useQuery({
    queryKey: ["business-profile"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/settings/business")
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch business profile")
      }

      return result as {
        businessProfile: BusinessProfile | null
      }
    },
  })
}

export function useUpdateBusinessProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: BusinessProfileFormValues) => {
      const response = await fetch("/api/dashboard/settings/business", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || "Failed to update business profile")
      }
      return result
    },

    // Global behaviors run here automatically
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["business-profile"] })

      toast.add({
        title: "Success",
        description: result.message || "Business profile updated successfully",
        type: "success",
      })
    },
    onError: (error) => {
      toast.add({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update profile",
        type: "error",
      })
    },
  })
}
