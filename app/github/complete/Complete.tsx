"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  GITHUB_POPUP_CHANNEL,
  type GithubPopupMessage,
} from "@/lib/github-popup";

export default function GithubComplete({ error }: { error: string | null }) {
  const router = useRouter();

  useEffect(() => {
    if (typeof BroadcastChannel !== "undefined") {
      const channel = new BroadcastChannel(GITHUB_POPUP_CHANNEL);
      const message: GithubPopupMessage = error
        ? { type: "error", error }
        : { type: "done" };

      channel.postMessage(message);
      channel.close();
    }

    // Only closes windows opened by a script. When this page was opened in a
    // normal tab (blocked popup, first install), the redirect below takes over.
    window.close();

    const timer = window.setTimeout(() => {
      router.replace(
        error
          ? `/dashboard?error=${encodeURIComponent(error)}`
          : "/dashboard/repositories",
      );
    }, 500);

    return () => window.clearTimeout(timer);
  }, [error, router]);

  return (
    <div className="flex min-h-dvh items-center justify-center gap-3 bg-neutral-100 p-6 font-sans text-sm text-neutral-600 dark:bg-neutral-950 dark:text-neutral-400">
      <Loader2 size={18} className="animate-spin" aria-hidden="true" />
      Returning to Plumbcode…
    </div>
  );
}
