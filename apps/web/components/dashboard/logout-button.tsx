"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { useAuthStore } from "@/app/store/useAuthStore" // 🚀 Import your Zustand store
import { useQueryClient } from "@tanstack/react-query" // 🚀 Import TanStack to clean cache tracking
import { DropdownMenuItem } from "@workspace/ui/components/dropdown-menu"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const setLoggingOut = useAuthStore((state) => state.setLoggingOut)
  const queryClient = useQueryClient()

  const handleLogout = async () => {
    try {
      // 1. Lock the flag to TRUE. Do not call logout() here! 🚀
      if (typeof setLoggingOut === "function") {
        setLoggingOut(true)
      }

      // 2. Clear out server cookies safely
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })

      // 3. Clear TanStack query records to prevent memory leaks
      queryClient.clear()

      // 4. Trigger route movement out of the dashboard
      startTransition(() => {
        router.push("/")
        router.refresh()
      })
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <DropdownMenuItem
      className="text-red-500 focus:text-red-500"
      onClick={handleLogout}
      disabled={isPending}
    >
      <LogOut className="mr-2 h-4 w-4" />
      {isPending ? "Logging out..." : "Sign Out"}
    </DropdownMenuItem>
    // <button
    //   onClick={handleLogout}
    //   disabled={isPending}
    //   className="text-sm font-medium text-red-500 hover:text-red-600 disabled:opacity-50"
    // >
    //   {isPending ? "Logging out..." : "Sign Out"}
    // </button>
  )
}
