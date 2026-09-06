"use client"

import { Skeleton } from "@workspace/ui/components/skeleton"

export function CustomerSkeleton() {
  return (
    <div className="w-full space-y-4 animate-pulse">
      {/* 1. Toolbar Row (Search Input & Filter Buttons) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search customers... input block */}
        <Skeleton className="h-10 w-full sm:max-w-xs bg-gray-100 dark:bg-zinc-800 rounded-lg" />
        
        <div className="flex items-center gap-2">
          {/* Status filter button */}
          <Skeleton className="h-10 w-24 bg-gray-100 dark:bg-zinc-800 rounded-lg" />
          {/* Columns dropdown button */}
          <Skeleton className="h-10 w-24 bg-gray-100 dark:bg-zinc-800 rounded-lg" />
        </div>
      </div>

      {/* 2. Tabular Customer Content Container */}
      <div className="border rounded-xl overflow-hidden shadow-sm bg-white dark:bg-zinc-950">
        {/* Table Head Row (5 columns matching layout headers) */}
        <div className="grid grid-cols-[1.5fr_2fr_1.5fr_1fr_1fr_0.5fr] p-4 border-b bg-gray-50/50 dark:bg-zinc-900/50 gap-4 items-center">
          {/* Checkbox placeholder + Customer name header */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-4 bg-gray-200 dark:bg-zinc-800 rounded" />
            <Skeleton className="h-4 w-20 bg-gray-200 dark:bg-zinc-800" />
          </div>
          {/* Email header */}
          <Skeleton className="h-4 w-16 bg-gray-200 dark:bg-zinc-800" />
          {/* Added date header */}
          <Skeleton className="h-4 w-20 bg-gray-200 dark:bg-zinc-800" />
          {/* Invoice count header */}
          <Skeleton className="h-4 w-14 bg-gray-200 dark:bg-zinc-800" />
          {/* Status badge header */}
          <Skeleton className="h-4 w-12 bg-gray-200 dark:bg-zinc-800" />
          {/* Empty spacer context for right actions dropdown icon */}
          <div />
        </div>

        {/* 3. Table Body Dynamic Rows Loading Placeholders */}
        <div className="divide-y divide-gray-100 dark:divide-zinc-800">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="grid grid-cols-[1.5fr_2fr_1.5fr_1fr_1fr_0.5fr] p-5 items-center gap-4">
              
              {/* Col 1: Selection checkbox indicator + Primary Customer Brand Name */}
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-4 bg-gray-100 dark:bg-zinc-800 rounded" />
                <Skeleton className="h-4 w-32 bg-gray-100 dark:bg-zinc-800" />
              </div>
              
              {/* Col 2: Customer Contact Email string field block */}
              <Skeleton className="h-4 w-48 bg-gray-100 dark:bg-zinc-800" />
              
              {/* Col 3: Date account context stamp creation metrics */}
              <Skeleton className="h-4 w-24 bg-gray-100 dark:bg-zinc-800" />
              
              {/* Col 4: Total associated invoice billing profiles quantity */}
              <Skeleton className="h-4 w-8 bg-gray-100 dark:bg-zinc-800" />
              
              {/* Col 5: Active status pill/badge outline container */}
              <Skeleton className="h-6 w-16 rounded-full bg-gray-100 dark:bg-zinc-800" />
              
              {/* Col 6: Options drop menu trigger icon button circular toggle (...) */}
              <div className="flex justify-end">
                <Skeleton className="h-8 w-8 rounded-md bg-gray-100 dark:bg-zinc-800 flex items-center justify-center" />
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
