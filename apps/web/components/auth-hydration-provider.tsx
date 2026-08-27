"use client"

import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useAuthStore } from "@/app/store/useAuthStore"
import { useRouter, usePathname } from "next/navigation"
import { AuthLoader } from "./auth/auth-loader"

export function AuthHydrationProvider({ children }: { children: React.ReactNode }) {
  const { user, token, setAuth, logout, isLoggingOut } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["auth-session"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me")
      if (!res.ok) throw new Error("Session invalid")
      return res.json()
    },
    enabled: !user || !token,
    retry: false,
  })

  // 1. Re-check session parameters on historical context updates
  useEffect(() => {
    if (!user || !token) {
      refetch()
    }
  }, [pathname, user, token, refetch])

  // 2. Hydrate valid profile profiles
  useEffect(() => {
    if (data?.user && data?.access_token) {
      setAuth(data.user, data.access_token)
    }
  }, [data, setAuth])

  // 3. Clean manual logouts safely
  useEffect(() => {
    if (isLoggingOut) {
      if (typeof logout === "function") logout()
    }
  }, [isLoggingOut, logout])

  // 4. Handle token validation lifecycle failures cleanly inside useEffect
  useEffect(() => {
    if (isError && !isLoggingOut) {
      if (typeof logout === "function") logout()
      
      // 🚀 SAFE ROUTING INTERCEPT: Post-hydration pass execution prevents router initialization conflicts
      router.replace("/login?error=session_invalid")
    }
  }, [isError, isLoggingOut, router, logout])

  // ==========================================
  // 🚀 THE FIX: RENDERING SAFETY LIFECYCLES
  // ==========================================

  // While checking your profile session state, display a loading screen
  if ((!user || !token) && isLoading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center space-y-2 bg-background">
        <AuthLoader />
        <p className="animate-pulse text-xs text-muted-foreground">
          Securing session context...
        </p>
      </div>
    )
  }

  // 🚀 FIXED HERE: If an error occurs, return an empty placeholder container layout block. 
  // DO NOT invoke any inline navigation commands here! Let the useEffect hook fire the route shift.
  if ((!user || !token) && isError) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background" />
    )
  }

  return <>{children}</>
}
