import { InvoiceStatus } from "@/hooks/use-invoice"
import { cn } from "@workspace/ui/lib/utils"

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus
}

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const statusValue = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",

        statusValue === "Paid" &&
          "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",

        statusValue === "Sent" && "bg-blue-500/10 text-blue-600 dark:text-blue-400",

        // statusValue === "Pending" &&
        //   "bg-amber-500/10 text-amber-600 dark:text-amber-400",

        statusValue === "Overdue" && "bg-red-500/10 text-red-600 dark:text-red-400",

        statusValue === "Cancelled" &&
          "bg-red-500/10 text-red-600 dark:text-red-400",

        statusValue === "Draft" && "bg-muted text-muted-foreground"
      )}
    >
      <span
        className={cn(
          "mr-1.5 h-1.5 w-1.5 rounded-full",

          statusValue === "Paid" && "bg-emerald-500",

          statusValue === "Sent" && "bg-blue-500",

          // statusValue === "Pending" && "bg-amber-500",

          statusValue === "Overdue" && "bg-red-500",

          statusValue === "Cancelled" && "bg-red-500",

          statusValue === "Draft" && "bg-muted-foreground"
        )}
      />

      {statusValue}
    </span>
  )
}
