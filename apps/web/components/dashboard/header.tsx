"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { SearchBar } from "./search-bar";
import { NotificationDropdown } from "./notification-dropdown";
import { UserMenu } from "./user-menu";
import { MobileSidebar } from "./mobile-sidebar";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-xl">
      <div className="flex h-20 items-center justify-between px-6">
        {/* Left */}
        <div className="flex items-center gap-4">
          <MobileSidebar />

          <SearchBar />
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          <NotificationDropdown />

          <UserMenu />
        </div>
      </div>
    </header>
  );
}