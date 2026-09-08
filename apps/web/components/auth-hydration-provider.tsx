"use client"

import { useEffect, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

import { useAuthStore } from "@/app/store/useAuthStore"

const SESSION_CHECK_INTERVAL = 2 * 60 * 1000

export function AuthHydrationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, token, setAuth, logout, isLoggingOut } = useAuthStore()
  const [sessionInvalid, setSessionInvalid] = useState(false)
  const isRedirecting = useRef(false)

  /*
   * Hydrate auth state from the HTTP-only cookie
   */
  const { data } = useQuery({
    queryKey: ["auth-session"],
    queryFn: async () => {
      // ⚠️ Guard 1: Hard block if the browser profile is offline
      if (typeof window !== "undefined" && !navigator.onLine) {
        throw new Error("Offline")
      }

      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error("Session invalid")
      }

      return response.json()
    },
    enabled: !isLoggingOut && !sessionInvalid && (!user || !token),
    retry: (failureCount, error: any) => {
      if (error.message === "Offline") return true; // Keep retrying until online
      return false;
    },
    staleTime: 1000 * 60 * 5,
  })

  /*
   * Store authenticated user returned from the server
   */
  useEffect(() => {
    if (data?.user && data?.access_token && !isLoggingOut && !sessionInvalid) {
      if (user?.id !== data.user.id || token !== data.access_token) {
        setAuth(data.user, data.access_token)
      }
    }
  }, [data, setAuth, user, token, isLoggingOut, sessionInvalid])

  /*
   * Monitor the server session.
   */
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined

    const checkSession = async () => {
      if (useAuthStore.getState().isLoggingOut) return
      if (document.visibilityState !== "visible") return

      // ⚠️ Guard 2: Skip interval checks completely if offline
      if (typeof window !== "undefined" && !navigator.onLine) {
        console.log("Device is offline. Skipping authorization check.")
        return
      }

      try {
        console.log("Checking authentication session...")
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        })

        console.log("Session response:", response.status)

        if (response.ok) {
          return
        }

        /*
         * ⚠️ THE FIX: Only log out if the server explicitly responds with 401 
         * AND the browser confirms it actually has a valid internet connection.
         */
        if (response.status === 401 && navigator.onLine) {
          console.log("Session verified as expired by remote server.")
          setSessionInvalid(true)

          try {
            await fetch("/api/auth/logout", {
              method: "POST",
              credentials: "include",
              cache: "no-store",
            })
          } catch (error) {
            console.error("Failed to clear authentication cookie:", error)
          }

          logout()
          router.replace("/login") // Pushes the user to login page smoothly
        }
      } catch (error) {
        console.error("Session monitor check failed due to network exception:", error)
      }
    }

    void checkSession()

    intervalId = setInterval(() => {
      void checkSession()
    }, SESSION_CHECK_INTERVAL)

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void checkSession()
      }
    }

    // Safely re-check session only when connection successfully returns
    const handleOnlineStatus = () => {
      console.log("Device back online. Re-verifying token status...")
      void checkSession()
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("online", handleOnlineStatus)

    return () => {
      if (intervalId) clearInterval(intervalId)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("online", handleOnlineStatus)
    }
  }, [logout, router])

  return <>{children}</>
}
