import { Skeleton } from "@workspace/ui/components/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-10 w-56" />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <Skeleton
            key={index}
            className="h-40 rounded-3xl"
          />
        ))}
      </div>

      <Skeleton className="h-[400px] rounded-3xl" />
    </div>
  );
}