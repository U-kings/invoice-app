"use client"

import { VerifyEmail } from "@/components/auth/verify-email"
import { useEffect, useState } from "react"

export default function VerifyEmailPage() {
  const [cooldown, setCooldown] = useState<number>(60)

  // Handles the countdown ticking mechanism
  useEffect(() => {
    if (cooldown <= 0) return

    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [cooldown])
  return <VerifyEmail pageType="reset-password" cooldown={cooldown} />
}
