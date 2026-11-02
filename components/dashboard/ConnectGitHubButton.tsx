"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { GithubIcon } from "@/components/GithubIcon";
import { authClient } from "@/lib/auth-client";

export default function ConnectGitHubButton({
  label = "Connect GitHub",
}: {
  label?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setLoading(true);

    try {
      const { error } = await authClient.linkSocial({
        provider: "github",
        callbackURL: "/dashboard",
      });

      if (error) {
        setError(
          error.message ?? "Couldn't connect GitHub. Please try again.",
        );
        setLoading(false);
      }
    } catch {
      setError("Couldn't connect GitHub. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 py-3 font-sans text-sm font-medium text-white transition-colors hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-60 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 dark:focus-visible:ring-white/30 dark:focus-visible:ring-offset-neutral-950 sm:w-auto"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <GithubIcon size={16} />
        )}
        {loading ? "Connecting…" : label}
      </button>

      {error && (
        <p
          role="alert"
          className="mt-3 font-sans text-sm text-red-700 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}
