import { InvoiceStatus } from "@/hooks/use-invoice"
import { cn } from "@workspace/ui/lib/utils"

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus
}

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",

        status === "Paid" &&
          "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",

        status === "Sent" && "bg-blue-500/10 text-blue-600 dark:text-blue-400",

        // status === "Pending" &&
        //   "bg-amber-500/10 text-amber-600 dark:text-amber-400",

        status === "Overdue" && "bg-red-500/10 text-red-600 dark:text-red-400",

        status === "Cancelled" &&
          "bg-red-500/10 text-red-600 dark:text-red-400",

        status === "Draft" && "bg-muted text-muted-foreground"
      )}
    >
      <span
        className={cn(
          "mr-1.5 h-1.5 w-1.5 rounded-full",

          status === "Paid" && "bg-emerald-500",

          status === "Sent" && "bg-blue-500",

          // status === "Pending" && "bg-amber-500",

          status === "Overdue" && "bg-red-500",

          status === "Cancelled" && "bg-red-500",

          status === "Draft" && "bg-muted-foreground"
        )}
      />

      {status}
    </span>
  )
}
