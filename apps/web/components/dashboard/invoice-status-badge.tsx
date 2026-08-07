import { cn } from "@workspace/ui/lib/utils";

interface Props {
  status: string;
}

export function InvoiceStatusBadge({
  status,
}: Props) {
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-xs font-medium",
        status === "Paid" &&
          "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",

        status === "Sent" &&
          "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",

        status === "Overdue" &&
          "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",

        status === "Draft" &&
          "bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300"
      )}
    >
      {status}
    </span>
  );
}