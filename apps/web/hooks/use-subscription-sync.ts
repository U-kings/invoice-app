"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"

interface SyncResult {
  success: boolean
  subscriptionStatus?: string
  error?: string
}

export function useSubscriptionSync() {
  const router = useRouter()
  const [isSyncing, setIsSyncing] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const sync = useCallback(async (): Promise<SyncResult> => {
    setIsSyncing(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/sync-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to synchronise subscription session.")
      }

      // 🚀 Refresh Next.js server components/middleware states immediately
      router.refresh()
      
      return { success: true, subscriptionStatus: data.subscriptionStatus }
    } catch (err: any) {
      const msg = err?.message || "An unexpected error occurred during sync."
      setError(msg)
      return { success: false, error: msg }
    } finally {
      setIsSyncing(false)
    }
  }, [router])

  return { sync, isSyncing, error }
}
