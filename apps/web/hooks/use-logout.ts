"use client"

import { useRouter } from "next/navigation"
import { useAuthStore } from "@/app/store/useAuthStore"
import { useQueryClient } from "@tanstack/react-query"

export function useLogout() {
  const router = useRouter()

  const setLoggingOut = useAuthStore(
    (state) => state.setLoggingOut,
  )

  const Authlogout = useAuthStore(
    (state) => state.logout,
  )

  const queryClient = useQueryClient()

  const logout = async () => {
    setLoggingOut(true)

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      })
    } catch (error) {
      console.error("Server logout failed:", error)
    } finally {
      // Clear the client authentication state
      Authlogout()

      // Remove all authenticated query data
      queryClient.clear()

      // Navigate only after everything is cleaned up
      router.replace("/")
    }
  }

  return {
    logout,
  }
}