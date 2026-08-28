"use client"

import { useLogout } from "@/hooks/use-logout"
import { DropdownMenuItem } from "@workspace/ui/components/dropdown-menu"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  const { logout, isPending } = useLogout()

  return (
    <DropdownMenuItem
      className="text-red-500 focus:text-red-500"
      onClick={logout}
      disabled={isPending}
    >
      <LogOut className="mr-2 h-4 w-4" />
      {isPending ? "Logging out..." : "Sign Out"}
    </DropdownMenuItem>
  )
}
