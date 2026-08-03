import { cn } from "@workspace/ui/lib/utils";
import Link from "next/link";

export function Logo({
  className,
}: {
  className?: string;
}) {
  return (
    <Link href="/">
    <div className={cn("flex items-center gap-3", className)}>
      <div className="space-y-1">
        <div className="h-2 w-7 rounded-full bg-[#2EAFB4]" />
        <div className="h-2 w-6 rounded-full bg-[#2EAFB4]/90" />
        <div className="h-2 w-5 rounded-full bg-[#2EAFB4]/80" />
      </div>

      <span className="text-xl font-bold">
        InvoiceFlow
      </span>
    </div>
    </Link>
  );
}