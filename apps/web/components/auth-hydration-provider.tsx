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

    retry: false,

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
   *
   * IMPORTANT:
   * This effect does NOT control normal logout.
   * The logout hook handles logout separately.
   */

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined

    const checkSession = async () => {
      /*
       * Don't run a background check while
       * the user is intentionally logging out.
       */
      if (useAuthStore.getState().isLoggingOut) {
        return
      }

      if (document.visibilityState !== "visible") {
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

        /*
         * Everything is fine.
         */
        if (response.ok) {
          return
        }

        /*
         * The server says the session is no longer valid.
         */
        if (response.status === 401) {
          console.log("Session expired or revoked")

          setSessionInvalid(true)

          /*
           * Clear the HTTP-only cookie.
           */
          try {
            await fetch("/api/auth/logout", {
              method: "POST",
              credentials: "include",
              cache: "no-store",
            })
          } catch (error) {
            console.error("Failed to clear authentication cookie:", error)
          }

          /*
           * Clear Zustand.
           */
          logout()

          /*
           * Redirect.
           */
          // router.replace("/login")
        }
      } catch (error) {
        /*
         * Network failures should not log
         * the user out.
         */
        console.error("Session monitor check failed:", error)
      }
    }

    /*
     * Run immediately.
     */
    void checkSession()

    /*
     * Check every 2 minutes.
     */
    intervalId = setInterval(() => {
      void checkSession()
    }, SESSION_CHECK_INTERVAL)

    /*
     * Check when the user returns to the tab.
     */
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void checkSession()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }

      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [logout, router])

  /*
   * Prevent authenticated UI from rendering
   * while an intentional logout is in progress.
   */
  // if (isLoggingOut) {
  //   return (
  //     <>
  //       {children}

  //       <div className="fixed inset-0 z-9999 flex items-center justify-center bg-background/80 backdrop-blur-sm">
  //         <div className="flex items-center gap-3 rounded-lg border bg-background px-5 py-3 shadow-lg">
  //           <div className="size-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />

  //           <span className="text-sm font-medium">Signing you out...</span>
  //         </div>
  //       </div>
  //     </>
  //   )
  // }

  return <>{children}</>
}
