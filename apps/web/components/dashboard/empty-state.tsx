import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed py-20 text-center">
      <Inbox className="mb-4 h-12 w-12 text-muted-foreground" />

      <h3 className="text-lg font-semibold">
        {title}
      </h3>

      <p className="mt-2 max-w-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

{/* <EmptyState
  title="No invoices yet"
  description="Create your first invoice to start tracking payments."
/> */}