"use client"

import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useAuthStore } from "@/app/store/useAuthStore"

export function AuthHydrationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, token, setAuth, isLoggingOut } = useAuthStore()

  // 1. All hooks are called unconditionally at the top level
  const { data } = useQuery({
    queryKey: ["auth-session"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me")
      if (!res.ok) throw new Error("Session invalid")
      return res.json()
    },
    enabled: !isLoggingOut && (!user || !token),
    retry: false,
    staleTime: 1000 * 60 * 5,
  })

  // 2. Hydration effect runs unconditionally
  useEffect(() => {
    if (data?.user && data?.access_token && !isLoggingOut) {
      if (user?.id !== data.user.id || token !== data.access_token) {
        setAuth(data.user, data.access_token)
      }
    }
  }, [data, setAuth, user, token, isLoggingOut])

  // 3. Conditional rendering happens safely at the return statement (No hooks skipped)
  if (isLoggingOut) {
    return (
      <div className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-background" />
    )
  }

  return <>{children}</>
}
