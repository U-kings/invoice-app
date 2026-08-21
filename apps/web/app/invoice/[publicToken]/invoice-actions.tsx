"use client"

import { Download, Loader2, Printer } from "lucide-react"
import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/toast"

type InvoiceActionsProps = {
  publicToken: string
}

export function InvoiceActions({
  publicToken,
}: InvoiceActionsProps) {
  const [isDownloading, setIsDownloading] =
    useState(false)

  async function handleDownload() {
    try {
      setIsDownloading(true)

      const response = await fetch(
        `/api/dashboard/invoices/public/${publicToken}/pdf`
      )

      if (!response.ok) {
        throw new Error(
          "Failed to download invoice"
        )
      }

      const blob = await response.blob()

      const url =
        window.URL.createObjectURL(blob)

      const link =
        document.createElement("a")

      link.href = url

      const contentDisposition =
        response.headers.get(
          "Content-Disposition"
        )

      const filename =
        contentDisposition?.match(
          /filename="([^"]+)"/
        )?.[1] ?? "invoice.pdf"

      link.download = filename

      document.body.appendChild(link)
      link.click()
      link.remove()

      window.URL.revokeObjectURL(url)

      toast.add({
        title: "Downloaded",
        type: "success",
        description:
          "Invoice downloaded successfully",
      })
    } catch (error) {
      console.error(error)

      toast.add({
        title: "Download failed",
        type: "error",
        description:
          "We couldn't download the invoice.",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  function handlePrint() {
    window.print()
  }

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end print:hidden">
      <Button
        variant="outline"
        onClick={handlePrint}
      >
        <Printer className="size-4" />
        Print
      </Button>

      <Button
        onClick={handleDownload}
        disabled={isDownloading}
        className="bg-[#2EAFB4] text-white hover:bg-[#269ca1]"
      >
        {isDownloading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Download className="size-4" />
        )}

        {isDownloading
          ? "Downloading..."
          : "Download PDF"}
      </Button>
    </div>
  )
}