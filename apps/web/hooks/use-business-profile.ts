import { useMutation, useQueryClient } from "@tanstack/react-query"

async function uploadBusinessLogo(file: File) {
  const formData = new FormData()

  formData.append("file", file)

  const response = await fetch(
    "/api/dashboard/settings/business/logo",
    {
      method: "POST",
      body: formData,
    }
  )

  const body = await response.json()

  if (!response.ok) {
    throw new Error(
      body?.error || "Failed to upload business logo."
    )
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
  const response = await fetch(
    "/api/dashboard/settings/business/logo",
    {
      method: "DELETE",
    }
  )

  const body = await response.json()

  if (!response.ok) {
    throw new Error(
      body?.error || "Failed to remove business logo."
    )
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