"use client"

import { Skeleton } from "@workspace/ui/components/skeleton"

export function InvoiceSkeleton() {
  return (
    <div className="animate-fade-in mx-auto w-full max-w-300 space-y-6">
      {/* 2. Top Stats Grid (4 Cards Row) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex h-32.5 items-center justify-between rounded-xl border bg-card p-6 shadow-sm"
          >
            <div className="w-3/4 space-y-3">
              {/* Card Label Heading */}
              <Skeleton className="h-4 w-24 bg-gray-100 dark:bg-zinc-800" />
              {/* Massive Value / Collected Numbers */}
              <Skeleton className="h-7 w-32 bg-gray-200 dark:bg-zinc-800" />
              {/* Secondary Card Footer label details */}
              <Skeleton className="h-3 w-20 bg-gray-100 dark:bg-zinc-800" />
            </div>
            {/* Circular Metric Icon box placeholder */}
            <Skeleton className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-zinc-800" />
          </div>
        ))}
      </div>

      {/* 3. Toolbar Row (Search Input Bar & Filter Tools Right Alignment) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Input Text Box Field Wrapper Search Block */}
        <Skeleton className="h-10 w-full rounded-lg bg-gray-100 sm:max-w-sm dark:bg-zinc-800" />
        <div className="flex items-center gap-2">
          {/* Status Dropdown Button Filter */}
          <Skeleton className="h-10 w-24 rounded-lg bg-gray-100 dark:bg-zinc-800" />
          {/* Columns Options Button Filter */}
          <Skeleton className="h-10 w-24 rounded-lg bg-gray-100 dark:bg-zinc-800" />
        </div>
      </div>

      {/* 4. Core Tabular Invoice Content Frame Grid */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-zinc-950">
        {/* Table Column Grid Header Header row text metrics */}
        <div className="grid grid-cols-6 gap-4 border-b bg-gray-50/50 p-4 dark:bg-zinc-900/50">
          <Skeleton className="h-4 w-16 bg-gray-200 dark:bg-zinc-800" />
          <Skeleton className="h-4 w-24 bg-gray-200 dark:bg-zinc-800" />
          <Skeleton className="h-4 w-20 bg-gray-200 dark:bg-zinc-800" />
          <Skeleton className="h-4 w-20 bg-gray-200 dark:bg-zinc-800" />
          <Skeleton className="h-4 w-16 bg-gray-200 dark:bg-zinc-800" />
          <Skeleton className="h-4 w-14 justify-self-end bg-gray-200 dark:bg-zinc-800" />
        </div>

        {/* Dynamic Table Loading Body Content Rows Blocks */}
        <div className="divide-y divide-gray-100 dark:divide-zinc-800">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-6 items-center gap-4 p-5"
            >
              {/* Column 1: Invoice tag marker ID */}
              <Skeleton className="h-5 w-20 bg-gray-100 dark:bg-zinc-800" />
              {/* Column 2: Customer Email properties string context block */}
              <Skeleton className="h-4 w-44 bg-gray-100 dark:bg-zinc-800" />
              {/* Column 3: Issue Registration Date stamp format mapping */}
              <Skeleton className="h-4 w-24 bg-gray-100 dark:bg-zinc-800" />
              {/* Column 4: Due Account execution timeframe details */}
              <Skeleton className="h-4 w-24 bg-gray-100 dark:bg-zinc-800" />
              {/* Column 5: Payment Amount totals evaluation text line */}
              <Skeleton className="h-5 w-16 bg-gray-100 dark:bg-zinc-800" />
              {/* Column 6: Option action menu badge elements dots link */}
              <div className="flex items-center gap-3 justify-self-end">
                <Skeleton className="h-6 w-16 rounded-full bg-gray-100 dark:bg-zinc-800" />
                <Skeleton className="h-4 w-4 rounded-full bg-gray-100 dark:bg-zinc-800" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Bottom Pagination Row */}
      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        {/* Left Side: Showing 1-2 of 2 invoices metrics info */}
        <Skeleton className="h-4 w-36 bg-gray-100 dark:bg-zinc-800" />
        <div className="flex items-center gap-4">
          {/* Rows per page options selectors labels items */}
          <Skeleton className="h-8 w-28 rounded-md bg-gray-100 dark:bg-zinc-800" />
          {/* Active Navigation numbers selector keys buttons frame */}
          <Skeleton className="h-8 w-20 rounded-md bg-gray-100 dark:bg-zinc-800" />
          {/* Chevron pagination controls shortcuts handlers toggles */}
          <div className="flex items-center gap-1">
            <Skeleton className="h-8 w-8 rounded-md bg-gray-100 dark:bg-zinc-800" />
            <Skeleton className="h-8 w-8 rounded-md bg-gray-100 dark:bg-zinc-800" />
          </div>
        </div>
      </div>
    </div>
  )
}
