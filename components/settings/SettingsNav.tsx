"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, SlidersHorizontal, User } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { label: "Account", href: "/dashboard/settings/account", icon: User },
  {
    label: "Preferences",
    href: "/dashboard/settings/preferences",
    icon: SlidersHorizontal,
  },
];

const LOGOUT_HREF = "/dashboard/settings/logout";

const item =
  "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20 dark:focus-visible:ring-white/30";

export default function SettingsNav() {
  const pathname = usePathname();
  const logoutActive = pathname === LOGOUT_HREF;

  return (
    <nav aria-label="Settings" className="md:w-52 md:shrink-0">
      <ul className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
        {ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;

          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  item,
                  active
                    ? "bg-white text-neutral-950 shadow-sm ring-1 ring-neutral-200 dark:bg-white/10 dark:text-white dark:ring-white/10"
                    : "text-neutral-600 hover:bg-neutral-200/60 hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-white",
                )}
              >
                <Icon size={16} aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}

        <li className="ml-1 border-l border-neutral-200 pl-1 md:ml-0 md:mt-4 md:border-l-0 md:border-t md:pl-0 md:pt-4 dark:border-white/10">
          <Link
            href={LOGOUT_HREF}
            aria-current={logoutActive ? "page" : undefined}
            className={cn(
              item,
              logoutActive
                ? "bg-red-500/10 text-red-600 dark:text-red-400"
                : "text-neutral-600 hover:bg-red-500/10 hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400",
            )}
          >
            <LogOut size={16} aria-hidden="true" />
            Log out
          </Link>
        </li>
      </ul>
    </nav>
  );
}
