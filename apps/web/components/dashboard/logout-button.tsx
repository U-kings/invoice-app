"use client"

import { useAuthStore } from "@/app/store/useAuthStore"
import { useLogout } from "@/hooks/use-logout"
import { DropdownMenuItem } from "@workspace/ui/components/dropdown-menu"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  const { logout } = useLogout()

  const { isLoggingOut } = useAuthStore()

  return (
    <DropdownMenuItem
      className="text-red-500 focus:text-red-500"
      onClick={logout}
      disabled={isLoggingOut}
    >
      <LogOut className="mr-2 h-4 w-4" />
      {isLoggingOut ? "Logging out..." : "Sign Out"}
    </DropdownMenuItem>
  )
}
