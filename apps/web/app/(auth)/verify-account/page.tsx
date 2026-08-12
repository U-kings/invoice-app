"use client"

import { VerifyEmail } from "@/components/auth/verify-email"
import { useMutation } from "@tanstack/react-query"
import React, { useEffect, useState } from "react"

interface PageProps {
  searchParams: Promise<{ email?: string }>
}

export default function VerifyAccountPage({ searchParams }: PageProps) {
  const resolvedParams = React.use(searchParams)
  const userEmail = resolvedParams.email || ""
  const [cooldown, setCooldown] = useState<number>(60)
  const [message, setMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  // Handles the countdown ticking mechanism
  useEffect(() => {
    if (cooldown <= 0) return

    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [cooldown])

  // Function that actually talks to your backend Resend route
  const { mutate: resendMutation, isPending } = useMutation({
    mutationFn: async (email: string) => {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()
      if (!res.ok)
        throw new Error(data.error || "Failed to trigger link delivery")
      return data
    },
    onSuccess: (data) => {
      console.log(data)
      setMessage({
        type: "success",
        text: "A new verification link has been sent!",
      })
      setCooldown(60) // Start the 60-second countdown
    },
    onError(error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to resend email.",
      })
    },
  })
  return (
    <VerifyEmail
      pageType="signup"
      onResendApiCall={resendMutation}
      cooldown={cooldown}
      isPending={isPending}
      message={message}
      email={userEmail}
    />
  )
}
