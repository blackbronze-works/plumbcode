"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import {
  GITHUB_POPUP_CHANNEL,
  type GithubPopupMessage,
} from "@/lib/github-popup";

type Props = {
  url: string | null;
};

export default function AddRepositoryCard({ url }: Props) {
  const router = useRouter();

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;

    const channel = new BroadcastChannel(GITHUB_POPUP_CHANNEL);

    channel.onmessage = (event: MessageEvent<GithubPopupMessage>) => {
      const message = event.data;

      if (!message || typeof message !== "object") return;

      if (message.type === "error") {
        router.push(`/dashboard?error=${encodeURIComponent(message.error)}`);
        return;
      }

      if (message.type === "done") {
        router.refresh();
      }
    };

    return () => channel.close();
  }, [router]);

  function openGithub() {
    if (!url) return;

    const width = 1000;
    const height = 800;
    const left = Math.max(0, window.screenX + (window.outerWidth - width) / 2);
    const top = Math.max(0, window.screenY + (window.outerHeight - height) / 2);

    const popup = window.open(
      url,
      "plumbcode-github",
      `width=${width},height=${height},left=${left},top=${top}`,
    );

    // Popup blocked: carry on in this window. The flow still returns to the
    // complete page after GitHub finishes.
    if (!popup) window.location.assign(url);
  }

  return (
    <button
      type="button"
      onClick={openGithub}
      disabled={!url}
      title={url ? undefined : "GitHub App isn't configured yet."}
      className="flex min-h-44 w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-neutral-300 p-5 font-sans text-sm font-medium text-neutral-600 transition-colors hover:border-neutral-500 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/20 dark:text-neutral-400 dark:hover:border-white/40 dark:hover:text-white dark:focus-visible:ring-white/30 dark:focus-visible:ring-offset-neutral-950"
    >
      <span
        className="flex size-10 items-center justify-center rounded-full border border-current"
        aria-hidden="true"
      >
        <Plus size={18} />
      </span>
      Add a repository
    </button>
  );
}
