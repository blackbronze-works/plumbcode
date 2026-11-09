"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const subscribe = () => () => {};

const OPTIONS = [
  {
    value: "light",
    label: "Light",
    icon: Sun,
    preview: "border-neutral-300 bg-white",
    line: "bg-neutral-300",
  },
  {
    value: "dark",
    label: "Dark",
    icon: Moon,
    preview: "border-neutral-700 bg-neutral-950",
    line: "bg-neutral-700",
  },
  {
    value: "system",
    label: "System",
    icon: Monitor,
    preview: "border-neutral-400 bg-linear-to-r from-white to-neutral-950",
    line: "bg-neutral-400",
  },
];

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  // false on the server, true in the browser: avoids a hydration mismatch
  // without setting state in an effect.
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const active = mounted ? (theme ?? "system") : null;

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="grid gap-3 sm:grid-cols-3"
    >
      {OPTIONS.map(({ value, label, icon: Icon, preview, line }) => {
        const selected = active === value;

        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setTheme(value)}
            className={cn(
              "rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20 dark:focus-visible:ring-white/30",
              selected
                ? "border-neutral-950 dark:border-white"
                : "border-neutral-200 hover:border-neutral-400 dark:border-white/10 dark:hover:border-white/30",
            )}
          >
            <span
              className={cn(
                "flex h-20 w-full flex-col justify-end gap-1.5 rounded-lg border p-2",
                preview,
              )}
              aria-hidden="true"
            >
              <span className={cn("h-1.5 w-2/3 rounded-full", line)} />
              <span className={cn("h-1.5 w-1/2 rounded-full", line)} />
            </span>
            <span className="mt-3 flex items-center justify-between font-sans text-sm font-medium text-neutral-950 dark:text-white">
              <span className="flex items-center gap-2">
                <Icon size={14} aria-hidden="true" />
                {label}
              </span>
              {selected && (
                <Check size={14} className="text-brand" aria-hidden="true" />
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
