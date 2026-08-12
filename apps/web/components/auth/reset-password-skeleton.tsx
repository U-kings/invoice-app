import { Skeleton } from "@workspace/ui/components/skeleton"

export function ResetPasswordSkeleton() {
  return (
    <div className="w-full flex flex-col items-center space-y-6">
      {/* Brand Logo */}
      <Skeleton className="h-8 w-32 bg-neutral-800" />
      
      {/* Header Texts */}
      <div className="w-full flex flex-col items-center space-y-2">
        <Skeleton className="h-7 w-3/4 bg-neutral-800" />
        <Skeleton className="h-4 w-full bg-neutral-800" />
        <Skeleton className="h-4 w-2/3 bg-neutral-800" />
      </div>
      
      {/* Form Fields */}
      <div className="w-full space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24 bg-neutral-800" />
          <Skeleton className="h-10 w-full bg-neutral-800/40" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-28 bg-neutral-800" />
          <Skeleton className="h-10 w-full bg-neutral-800/40" />
        </div>
      </div>
      
      {/* Accent Button (Tinted to match your teal theme background) */}
      <Skeleton className="h-11 w-full bg-teal-500/20" />
      
      {/* Secure Footer Text */}
      <Skeleton className="h-4 w-40 bg-neutral-800" />
    </div>
  )
}
