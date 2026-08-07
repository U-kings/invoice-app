"use client";

import { Search } from "lucide-react";

export function SearchBar() {
  return (
    <button className="flex h-11 w-full max-w-md items-center justify-between rounded-xl border bg-background px-4 text-sm text-muted-foreground transition hover:border-[#2EAFB4]">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4" />

        <span>Search...</span>
      </div>

      <kbd className="rounded border px-2 py-1 text-xs">
        Ctrl K
      </kbd>
    </button>
  );
}