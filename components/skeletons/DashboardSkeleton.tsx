import Skeleton from "./Skeleton";

export default function DashboardSkeleton() {
  return (
    <div role="status">
      <div className="space-y-3">
        <Skeleton className="h-9 w-80 max-w-full" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      <div className="mt-8 space-y-4">
        <div className="flex items-baseline justify-between gap-3">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-36 rounded-2xl" />
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-64 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>

        <Skeleton className="h-44 rounded-2xl" />
        <Skeleton className="h-56 rounded-2xl" />
      </div>

      <span className="sr-only">Loading dashboard…</span>
    </div>
  );
}
