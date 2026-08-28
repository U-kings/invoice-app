"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { useAuthStore } from "@/app/store/useAuthStore"
import { useQueryClient } from "@tanstack/react-query"

export function useLogout() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const setLoggingOut = useAuthStore((state) => state.setLoggingOut)
  const queryClient = useQueryClient()
  const Authlogout = useAuthStore((state) => state.logout)

  const logout = async () => {
    // 1. Lock state and trigger navigation INSTANTLY to prevent any dashboard flash
    if (typeof setLoggingOut === "function") {
      setLoggingOut(true)
    }

    startTransition(() => {
      router.push("/")
      router.refresh()
    })

    try {
      // 2. Clear store, query cache, and cookies in the background concurrently
      Authlogout()
      queryClient.clear()

      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
    } catch (error) {
      console.error("Logout cleanup failed:", error)
    }
  }

  return { logout, isPending }
}