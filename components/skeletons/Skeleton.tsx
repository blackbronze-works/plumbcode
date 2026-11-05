type SkeletonProps = {
  className?: string;
};

/**
 * Base shimmer block for loading states. Marked decorative so the surrounding
 * skeleton can provide a single screen-reader announcement.
 */
export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-neutral-200 motion-reduce:animate-none dark:bg-white/10 ${className ?? ""}`}
    />
  );
}
