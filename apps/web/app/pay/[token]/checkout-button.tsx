"use client"

import { PublicInvoice } from "@/hooks/use-public-invoice"
import { useMutation } from "@tanstack/react-query"
import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/toast"
import { Loader2 } from "lucide-react" // Using a standard Lucide loading spinner asset

interface CheckoutButtonProps {
  invoice: PublicInvoice
  invoiceId: string
  businessCountry: string
  customerCountry: string
}

interface CheckoutPayload {
  businessCountry: string
  customerCountry: string
}

export function CheckoutButton({
  invoice,
  invoiceId,
  businessCountry,
  customerCountry,
}: CheckoutButtonProps) {
  // 🚀 1. Set up the TanStack mutation pipeline to contact your backend route
  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: CheckoutPayload) => {
      // Passes invoiceId inside the dynamic URL path slug matching your route structure
      const res = await fetch(`/api/payment/checkout/${invoiceId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(
          data.error || "Failed to initialize secure checkout transaction link"
        )
      }
      return data // Expected response from your createCheckout helper (e.g., Paystack/Flutterwave link details)
    },
    onSuccess: (data) => {
      toast.add({
        title: "Redirecting to Payment Gateway...",
        description:
          "Please complete your payment on the secure external gateway.",
        type: "success",
      })

      // 🚀 2. Redirect the user to the third-party payment checkout URL (e.g. Paystack authorization URL)
      if (data.authorization_url || data.url) {
        window.location.href = data.authorization_url || data.url
      } else {
        console.error(
          "Payment authorization URL missing from checkout response data profile:",
          data
        )
        toast.add({
          title: "Payment Link Error",
          description: "Could not resolve a valid checkout link destination.",
          type: "error",
        })
      }
    },
    onError: (error: Error) => {
      toast.add({
        title: "Checkout Initialization Failed",
        description: error.message,
        type: "error",
      })
    },
  })

  const handleCheckoutClick = () => {
    // Trigger the backend route execution passing payload parameters
    mutate({
      businessCountry,
      customerCountry,
    })
  }

  const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: invoice.currency,
  })

  return (
    <Button
      type="button"
      onClick={handleCheckoutClick}
      disabled={isPending}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#2EAFB4] font-medium text-white shadow-sm transition-colors hover:bg-[#289ca0] disabled:opacity-50"
    >
      {isPending ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Processing Payment...</span>
        </>
      ) : (
        <span>Pay {formatter.format(invoice.total)}</span>
      )}

      {/* <Button
        className="h-12 w-full bg-[#2EAFB4] text-white hover:bg-[#269ba0]"
        size="lg"
      >
        Pay {formatter.format(invoice.total)}
      </Button> */}
    </Button>
  )
}
