"use client"

import {
  User,
  CreditCard,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  User2,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { useAuthStore } from "@/app/store/useAuthStore"

export function UserMenu() {
  const userData = useAuthStore((state) => state.user)

  const router = useRouter()

  // Inside your Client Component:
  const [isPending, startTransition] = useTransition()

  console.log(userData)

  const handleLogout = async () => {
    try {
      // 1. Clear the HttpOnly session cookie on the server
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })

      // 2. Safe navigation wrapper to clear the layout caches seamlessly
      startTransition(() => {
        router.push("/")
        router.refresh()
      })
    } catch (error) {
      console.error("Logout failed:", error)
    }

    // await fetch("/api/auth/logout", {
    //   method: "POST",
    //   credentials: "include",
    // })

    // router.push("/")
    // router.refresh()
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="cursor-pointer rounded-full focus:outline-none">
          {/* <button className="rounded-full focus:outline-none"> */}
          <Avatar className="h-10 w-10">
            <AvatarImage src="/avatars/avatar-user.png" />

            <AvatarFallback>{userData?.firstName?.charAt(0)}{userData?.lastName?.charAt(0)}</AvatarFallback>
          </Avatar>
          {/* </button> */}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72">
        {/* <DropdownMenuLabel> */}
        {/* <div className="space-y-1"> */}
        <div className="px-3 py-2">
          <p className="font-semibold">{userData?.firstName}{" "}{userData?.lastName}</p>

          <p className="text-xs text-muted-foreground">{userData?.email}</p>
        </div>
        {/* </DropdownMenuLabel> */}

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>

          <DropdownMenuItem>
            <CreditCard className="mr-2 h-4 w-4" />
            Billing
          </DropdownMenuItem>

          <DropdownMenuItem>
            <Users className="mr-2 h-4 w-4" />
            Team
          </DropdownMenuItem>

          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>

          <DropdownMenuItem>
            <HelpCircle className="mr-2 h-4 w-4" />
            Help
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="text-red-500 focus:text-red-500"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
