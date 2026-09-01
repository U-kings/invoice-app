import { PaymentStatus } from "@/hooks/use-payment"
import { cn } from "@workspace/ui/lib/utils"

interface InvoiceStatusBadgeProps {
  status: PaymentStatus
}

export function PaymentStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const statusValue =
    status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",

        statusValue === "SUCCESS" &&
          "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",

        statusValue === "PENDING" &&
          "bg-amber-500/10 text-amber-600 dark:text-amber-400",

        statusValue === "PROCESSING" &&
          "bg-blue-500/10 text-blue-600 dark:text-blue-400",

        statusValue === "FAILED" &&
          "bg-red-500/10 text-red-600 dark:text-red-400",

        statusValue === "CANCELLED" && "bg-muted text-muted-foreground",

        statusValue === "EXPIRED" &&
          "bg-orange-500/10 text-orange-600 dark:text-orange-400"
      )}
    >
      <span
        className={cn(
          "mr-1.5 h-1.5 w-1.5 rounded-full",

          statusValue === "SUCCESS" && "bg-emerald-500",

          statusValue === "PENDING" && "bg-amber-500",

          statusValue === "PROCESSING" && "bg-blue-500",

          statusValue === "FAILED" && "bg-red-500",

          statusValue === "CANCELLED" && "bg-muted text-muted-foreground",

          statusValue === "EXPIRED" && "bg-orange-500"
        )}
      />

      {statusValue}
    </span>
  )
}
