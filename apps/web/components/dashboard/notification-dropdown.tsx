"use client"

import { Bell } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@workspace/ui/components/dropdown-menu"

import { Button } from "@workspace/ui/components/button"

export function NotificationDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        {/* <Button
          size="icon"
          variant="ghost"
          className="relative"
        > */}
        <div className="relative cursor-pointer mr-2">
          <Bell className="h-4 w-4" />

          <span className="absolute top-0 -right-1 h-2 w-2 rounded-full bg-red-500" />
        </div>
        {/* </Button> */}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <div className="p-4">
          <h4 className="font-semibold">Notifications</h4>

          <p className="mt-1 text-sm text-muted-foreground">
            You&apos;re all caught up 🎉
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

{
  /* <DropdownMenuContent align="end">
  <DropdownMenuLabel>
    <div>
      <p className="font-semibold">
        Kingsley
      </p>

      <p className="text-xs text-muted-foreground">
        kingsley@example.com
      </p>
    </div>
  </DropdownMenuLabel>

  <DropdownMenuSeparator />

  <DropdownMenuItem>
    Profile
  </DropdownMenuItem>

  <DropdownMenuItem>
    Billing
  </DropdownMenuItem>

  <DropdownMenuItem>
    Team
  </DropdownMenuItem>

  <DropdownMenuItem>
    Settings
  </DropdownMenuItem>

  <DropdownMenuSeparator />

  <DropdownMenuItem className="text-red-500">
    Logout
  </DropdownMenuItem>
</DropdownMenuContent> */
}
