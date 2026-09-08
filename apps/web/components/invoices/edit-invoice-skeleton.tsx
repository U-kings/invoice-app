import { Skeleton } from "@workspace/ui/components/skeleton"

export default function EditInvoiceSkeleton() {
  return (
    <div className="mx-auto w-full space-y-6">
      {/* 1. Page Header (Title & Subtitle) */}
      <div className="space-y-1.5 pb-2">
        <Skeleton className="h-7 w-40" /> {/* "Edit invoice" */}
        <Skeleton className="h-4 w-48" /> {/* "Update the details of INV-1." */}
      </div>

      {/* 2. Main Form Container Card */}
      <div className="space-y-8 rounded-xl border bg-card p-6">
        {/* Section Heading Description */}
        <div className="space-y-1">
          <Skeleton className="h-5 w-44" /> {/* "Invoice information" */}
          <Skeleton className="h-4 w-64" />{" "}
          {/* "Add the basic information..." */}
        </div>

        {/* Input Fields Grid Row 1 (Invoice Number & Customer Selection) */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
          {/* Invoice Number Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-52" /> {/* Label + (auto-generated) */}
            <Skeleton className="h-10 w-full rounded-md" />{" "}
            {/* Disabled Input field */}
            <Skeleton className="h-3 w-48" />{" "}
            {/* Subtext: "A unique identifier..." */}
          </div>

          {/* Customer Dropdown Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" /> {/* Label: Customer */}
            <div className="relative">
              <Skeleton className="h-10 w-full rounded-md" />{" "}
              {/* Select Input trigger */}
              <Skeleton className="absolute top-3.5 right-3 h-3 w-3 rounded-sm" />{" "}
              {/* Dropdown chevron icon */}
            </div>
          </div>
        </div>

        {/* Input Fields Grid Row 2 (Customer Email & Currency Dropdown) */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
          {/* Customer Email Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" /> {/* Label: Customer email */}
            <Skeleton className="h-10 w-full rounded-md" />{" "}
            {/* Email Input box */}
          </div>

          {/* Currency Dropdown Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" /> {/* Label: Currency */}
            <div className="relative">
              <Skeleton className="h-10 w-full rounded-md" />{" "}
              {/* Currency select trigger */}
              <Skeleton className="absolute top-3.5 right-3 h-3 w-3 rounded-sm" />{" "}
              {/* Dropdown chevron icon */}
            </div>
          </div>
        </div>

        {/* Input Fields Grid Row 3 (Issue Date & Payment Terms Dropdown) */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
          {/* Issue Date Picker */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" /> {/* Label: Issue date */}
            <div className="relative">
              <Skeleton className="h-10 w-full rounded-md" />{" "}
              {/* Date Input box */}
              <Skeleton className="absolute top-3.5 right-3 h-4 w-4 rounded-sm" />{" "}
              {/* Calendar small icon */}
            </div>
          </div>

          {/* Payment Terms Dropdown Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" /> {/* Label: Payment terms */}
            <div className="relative">
              <Skeleton className="h-10 w-full rounded-md" />{" "}
              {/* Terms select trigger */}
              <Skeleton className="absolute top-3.5 right-3 h-3 w-3 rounded-sm" />{" "}
              {/* Dropdown chevron icon */}
            </div>
          </div>
        </div>

        {/* Input Fields Grid Row 4 (Due Date & Status Dropdown) */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
          {/* Due Date Picker */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" /> {/* Label: Due date */}
            <div className="relative">
              <Skeleton className="h-10 w-full rounded-md" />{" "}
              {/* Date Input box */}
              <Skeleton className="absolute top-3.5 right-3 h-4 w-4 rounded-sm" />{" "}
              {/* Calendar small icon */}
            </div>
            <Skeleton className="h-3 w-72" />{" "}
            {/* Subtext: "Required when payment terms..." */}
          </div>

          {/* Status Dropdown Field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" /> {/* Label: Status */}
            <div className="relative">
              <Skeleton className="h-10 w-full rounded-md" />{" "}
              {/* Status select trigger */}
              <Skeleton className="absolute top-3.5 right-3 h-3 w-3 rounded-sm" />{" "}
              {/* Dropdown chevron icon */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
