import Skeleton from "./Skeleton";

const CARD =
  "rounded-2xl border border-neutral-200 bg-white p-5 dark:border-white/10 dark:bg-neutral-950";

export default function RepositoriesSkeleton() {
  return (
    <div role="status" className="mt-6">
      <Skeleton className="h-3 w-40 max-w-full" />

      <ul className="mt-3 grid gap-4 sm:grid-cols-2">
        {[0, 1].map((index) => (
          <li key={index} className={CARD}>
            <div className="flex items-start gap-3">
              <Skeleton className="size-10 shrink-0 rounded-xl" />

              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-5 w-40 max-w-full" />
                <Skeleton className="h-3 w-36 max-w-full" />
              </div>

              <Skeleton className="h-5 w-14 shrink-0 rounded-full" />
            </div>

            <div className="mt-5 flex-1 space-y-2 border-t border-neutral-200 pt-4 dark:border-white/10">
              <Skeleton className="h-4 w-32 max-w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>

            <Skeleton className="mt-4 h-3 w-52 max-w-full" />
            <Skeleton className="mt-5 h-10 w-full rounded-full" />
          </li>
        ))}
      </ul>

      <span className="sr-only">Loading repositories…</span>
    </div>
  );
}
