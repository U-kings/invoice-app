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



export default function SingleInvoiceSkeleton() {
  return (
    <div className="w-full mx-auto space-y-6">
      
      {/* 1. Header Section (Invoice Title, Status, and Action Buttons) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div className="space-y-2">
          {/* Back button link placeholder */}
          <Skeleton className="h-4 w-24" />
          <div className="flex items-center gap-3">
            {/* Invoice ID (INV-1) */}
            <Skeleton className="h-8 w-28" />
            {/* Overdue Badge */}
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          {/* Issued / Due dates text */}
          <Skeleton className="h-4 w-48" />
        </div>
        
        {/* Top Right Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Skeleton className="h-9 w-16 rounded-md" /> {/* Edit Button */}
          <Skeleton className="h-9 w-32 rounded-md" /> {/* Download PDF Button */}
          <Skeleton className="h-9 w-9 rounded-md" />  {/* More (...) Button */}
        </div>
      </div>

      {/* 2. Addresses Grid Block (From / Bill To) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-xl bg-card">
        {/* From Section */}
        <div className="space-y-3">
          <Skeleton className="h-3 w-12" /> {/* FROM Label */}
          <Skeleton className="h-5 w-32" /> {/* Company Name */}
          <Skeleton className="h-4 w-40" /> {/* Street Address */}
          <Skeleton className="h-4 w-28" /> {/* City, Country */}
          <Skeleton className="h-4 w-44" /> {/* Email Contact */}
        </div>
        
        {/* Bill To Section */}
        <div className="space-y-3">
          <Skeleton className="h-3 w-14" /> {/* BILL TO Label */}
          <Skeleton className="h-5 w-32" /> {/* Client Name */}
          <Skeleton className="h-4 w-40" /> {/* Client Address */}
          <Skeleton className="h-4 w-28" /> {/* Client City */}
          <Skeleton className="h-4 w-52" /> {/* Client Email */}
        </div>
      </div>

      {/* 3. Items & Totals Table Section */}
      <div className="border rounded-xl bg-card overflow-hidden">
        {/* Table Headers */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b bg-muted/40 text-xs font-medium">
          <div className="col-span-6"><Skeleton className="h-3 w-28" /></div>
          <div className="col-span-2 text-right"><Skeleton className="h-3 w-8 ml-auto" /></div>
          <div className="col-span-2 text-right"><Skeleton className="h-3 w-10 ml-auto" /></div>
          <div className="col-span-2 text-right"><Skeleton className="h-3 w-12 ml-auto" /></div>
        </div>
        
        {/* Table Row (Web Development Item) */}
        <div className="grid grid-cols-12 gap-4 p-6 border-b items-center">
          <div className="col-span-6 space-y-2">
            <Skeleton className="h-5 w-40" />       {/* Web Development Title */}
            <Skeleton className="h-4 w-64" />       {/* Frontend/Backend description */}
          </div>
          <div className="col-span-2"><Skeleton className="h-4 w-4 ml-auto" /></div>   {/* Qty (1) */}
          <div className="col-span-2"><Skeleton className="h-4 w-14 ml-auto" /></div>  {/* Rate (#2500) */}
          <div className="col-span-2"><Skeleton className="h-4 w-20 ml-auto" /></div>  {/* Amount (#2,500.00) */}
        </div>

        {/* Totals Summary Stack Box (Subtotal, Tax, Grand Total) */}
        <div className="p-6 space-y-4 max-w-sm ml-auto">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-14" />
          </div>
          <div className="flex justify-between items-center pt-2 border-t">
            <Skeleton className="h-5 w-12 font-bold" />
            <Skeleton className="h-6 w-24 font-bold" />
          </div>
        </div>
      </div>

      {/* 4. Bottom Grid Layout (Payment Info & Activity Log) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Payment Info Card */}
        <div className="p-6 border rounded-xl bg-card space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-5 w-36" /> {/* Payment information Heading */}
            <Skeleton className="h-3 w-56" /> {/* Subtext helper */}
          </div>
          
          {/* Row Item: Status */}
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-5 rounded-md" /> {/* Icon anchor */}
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-6 w-16 rounded-full" /> {/* Status over-due state */}
          </div>

          {/* Row Item: Amount Due */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-5 rounded-md" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
            <Skeleton className="h-5 w-24" />
          </div>
        </div>

        {/* Activity Log Card */}
        <div className="p-6 border rounded-xl bg-card space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-5 w-16" /> {/* Activity Heading */}
            <Skeleton className="h-3 w-44" /> {/* Subtext helper */}
          </div>

          {/* Timeline Feed Container */}
          <div className="space-y-6 pl-2 relative border-l-2 border-muted ml-2">
            {/* Log Node 1 */}
            <div className="relative pl-6">
              <div className="absolute -left-7.75 top-1 bg-background p-0.5"><Skeleton className="h-3 w-3 rounded-full" /></div>
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3.5 w-52" />
                </div>
                <Skeleton className="h-3.5 w-16 shrink-0" />
              </div>
            </div>

            {/* Log Node 2 */}
            <div className="relative pl-6">
              <div className="absolute -left-7.75 top-1 bg-background p-0.5"><Skeleton className="h-3 w-3 rounded-full" /></div>
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3.5 w-28" />
                </div>
                <Skeleton className="h-3.5 w-16 shrink-0" />
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}

