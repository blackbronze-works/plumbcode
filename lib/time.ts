export function timeAgo(date: Date, now = Date.now()): string {
  const seconds = Math.max(1, Math.floor((now - date.getTime()) / 1000));

  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  const nowDate = new Date(now);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(date.getFullYear() === nowDate.getFullYear()
      ? {}
      : { year: "numeric" }),
  });
}
