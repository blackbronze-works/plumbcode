"use client";

import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export default function RefreshButton() {
  const router = useRouter();

  function handleClick() {
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 rounded-sm font-sans text-sm font-medium text-neutral-700 underline-offset-4 transition-colors hover:text-neutral-950 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/30 dark:text-neutral-300 dark:hover:text-white dark:focus-visible:ring-white/40"
    >
      <RefreshCw size={14} aria-hidden="true" />
      Refresh
    </button>
  );
}
