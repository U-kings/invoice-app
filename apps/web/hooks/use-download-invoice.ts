"use client"

import { useMutation } from "@tanstack/react-query"
import { toast } from "@workspace/ui/components/toast"

type DownloadInvoiceParams = {
  invoiceId: string | undefined
}

export function useDownloadInvoice() {
  return useMutation({
    mutationFn: async ({ invoiceId }: DownloadInvoiceParams) => {
      if (!invoiceId) {
        return { success: false, error: "Invoice ID is missing" }
      }

      const response = await fetch(`/api/dashboard/invoices/${invoiceId}/pdf`, {
        method: "POST",
      })

      if (!response.ok) {
        const contentType = response.headers.get("content-type")
        let errorMessage = "Failed to download invoice"

        if (contentType && contentType.includes("application/json")) {
          const data = await response.json().catch(() => null)
          errorMessage = data?.error ?? errorMessage
        } else {
          const textError = await response.text().catch(() => "")
          errorMessage = textError || errorMessage
        }

        // RETURN instead of throwing to block Next.js dev overlay
        return { success: false, error: errorMessage }
      }

      const blob = await response.blob()
      const contentDisposition = response.headers.get("Content-Disposition")
      const filename = contentDisposition?.match(/filename="([^"]+)"/)?.[1] ?? "invoice.pdf"

      return { success: true, blob, filename }
    },

    onSuccess: (data) => {
      // Handle your custom failure payload gracefully here
      if (data && !data.success) {
        toast.add({
          title: "Failed",
          type: "error",
          description: data.error || "Failed to download invoice",
        })
        return
      }

      // Safe downloading path execution
      const { blob, filename } = data as { blob: Blob; filename: string }
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.add({
        title: "Success",
        type: "success",
        description: "Invoice downloaded successfully",
      })
    },

    onError: (error) => {
      // This will only trigger on raw network connection timeouts/failures now
      console.error("Network crash:", error)
    },
  })
}




// "use client"

// import { useMutation } from "@tanstack/react-query"
// import { toast } from "@workspace/ui/components/toast"

// type DownloadInvoiceParams = {
//   invoiceId: string
// }

// export function useDownloadInvoice() {
//   return useMutation({
//     mutationFn: async ({ invoiceId }: DownloadInvoiceParams) => {
//       if (!invoiceId) {
//         throw new Error("Invoice ID is missing")
//       }

//       const response = await fetch(
//         `/api/dashboard/invoices/${invoiceId}/pdf`,
//         {
//           method: "POST",
//         }
//       )

//       if (!response.ok) {
//         const data = await response.json().catch(() => null)

//         throw new Error(
//           data?.error ?? "Failed to download invoice"
//         )
//       }

//       return {
//         blob: await response.blob(),
//         filename:
//           response.headers
//             .get("Content-Disposition")
//             ?.match(/filename="([^"]+)"/)?.[1] ??
//           "invoice.pdf",
//       }
//     },

//     onSuccess: ({ blob, filename }) => {
//       const url = window.URL.createObjectURL(blob)
//     //   window.open(url, "_blank")

//       const link = document.createElement("a")
//       link.href = url
//       link.download = filename

//       document.body.appendChild(link)
//       link.click()
//       link.remove()

//       window.URL.revokeObjectURL(url)

//       toast.add({
//         title: "Success",
//         type: "success",
//         description: "Invoice downloaded successfully",
//       })
//     },

//     onError: (error) => {
//       console.error("Invoice download failed:", error)

//       toast.add({
//         title: "Failed",
//         type: "error",
//         description:
//           error instanceof Error
//             ? error.message
//             : "Failed to download invoice",
//       })
//     },
//   })
// }