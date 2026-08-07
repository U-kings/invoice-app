import { cn } from "@workspace/ui/lib/utils";

interface Props {
  status: string;
}

export function PaymentStatusBadge({
  status,
}: Props) {
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-xs font-medium",

        status === "Completed" &&
          "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",

        status === "Pending" &&
          "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400"
      )}
    >
      {status}
    </span>
  );
}