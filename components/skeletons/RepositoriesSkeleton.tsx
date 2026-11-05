import Skeleton from "./Skeleton";

const CARD =
  "rounded-2xl border border-neutral-200 bg-white p-5 dark:border-white/10 dark:bg-neutral-950";

export default function RepositoriesSkeleton() {
  return (
    <div role="status" className="mt-8">
      <ul className="grid gap-4 sm:grid-cols-2">
        {[0, 1].map((index) => (
          <li key={index} className={CARD}>
            <div className="flex items-start justify-between gap-3">
              <Skeleton className="h-5 w-40 max-w-full" />
              <Skeleton className="h-5 w-14 shrink-0 rounded-full" />
            </div>

            <div className="mt-4 space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-2/3" />
            </div>

            <Skeleton className="mt-5 h-9 w-32 rounded-lg" />
          </li>
        ))}
      </ul>

      <span className="sr-only">Loading repositories…</span>
    </div>
  );
}
