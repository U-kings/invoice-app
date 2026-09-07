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
import { useAuthStore } from "@/app/store/useAuthStore"
import { LogoutButton } from "./logout-button"
import { useProfile } from "@/hooks/use-profile"
import Link from "next/link"

export function UserMenu() {
  // const userData = useAuthStore((state) => state.user)

  const profileQuery = useProfile()

  const userData = profileQuery.data

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="cursor-pointer rounded-full focus:outline-none">
          {/* <button className="rounded-full focus:outline-none"> */}
          <Avatar className="h-10 w-10">
            <AvatarImage src={userData?.profileImageUrl ?? ""} />
            {/* <AvatarImage src="/avatars/avatar-user.png" /> */}

            <AvatarFallback>
              {userData?.firstName?.charAt(0)}
              {userData?.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          {/* </button> */}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-full max-w-65 rounded-lg border bg-popover p-1 text-popover-foreground shadow-md"
      >
        {/* <DropdownMenuContent align="end" className="w-72"> */}
        {/* <DropdownMenuLabel> */}
        {/* <div className="space-y-1"> */}
        <div className="px-3 py-2">
          <p className="font-semibold">
            {userData?.firstName} {userData?.lastName}
          </p>

          <p className="text-xs text-muted-foreground">{userData?.email}</p>
        </div>
        {/* </DropdownMenuLabel> */}

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href="/dashboard/settings/profile" />}>
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>

          <DropdownMenuItem render={<Link href="/dashboard/billing" />}>
            <CreditCard className="mr-2 h-4 w-4" />
            Billing
          </DropdownMenuItem>

          {/* <DropdownMenuItem render={<Link href="/dashboard/team" />}>
            <Users className="mr-2 h-4 w-4" />
            Team
          </DropdownMenuItem> */}

          <DropdownMenuItem render={<Link href="/dashboard/settings" />}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>

          <DropdownMenuItem render={<Link href="/dashboard/help" />}>
            <HelpCircle className="mr-2 h-4 w-4" />
            Help
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <LogoutButton />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
