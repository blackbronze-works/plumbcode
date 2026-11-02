"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronUp,
  GitBranch,
  Home,
  LogOut,
  Menu,
  ScrollText,
  Settings,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  ready: boolean;
};

// Flip `ready` to true as each page gets built.
// Unfinished pages show "Soon" instead of a link that 404s.
const NAV: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: Home, ready: true },
  { label: "Principles", href: "/dashboard/principles", icon: ScrollText, ready: false },
  { label: "Repositories", href: "/dashboard/repos", icon: GitBranch, ready: false },
  { label: "Settings", href: "/dashboard/settings", icon: Settings, ready: false },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

type BodyProps = {
  userName: string;
  userEmail: string;
  onNavigate: () => void;
  collapsed: boolean;
};

// Defined outside Sidebar so React doesn't remount it on every render
function SidebarBody({ userName, userEmail, onNavigate, collapsed }: BodyProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <div className="flex items-center justify-between px-4 py-6">
        <Link href="/" aria-label="Plumbcode home" className="inline-flex">
          <Image
            src="/img/plumbcode-black.png"
            alt="Plumbcode"
            width={120}
            height={28}
            className="h-7 w-auto dark:hidden"
          />
          <Image
            src="/img/plumbcode-white.png"
            alt="Plumbcode"
            width={120}
            height={28}
            className="hidden h-7 w-auto dark:block"
          />
        </Link>
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-label="Collapse sidebar"
          className="inline-flex size-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-200/60 hover:text-neutral-950 dark:hover:bg-white/5 dark:hover:text-white"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      <nav aria-label="Dashboard" className="flex flex-col gap-1 px-3">
        {NAV.map((item) => {
          const Icon = item.icon;

          if (!item.ready) {
            return (
              <span
                key={item.href}
                aria-disabled="true"
                className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-500"
              >
                <Icon size={16} />
                {!collapsed && item.label}
                {!collapsed && !item.ready && (
                  <span className="ml-auto rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-neutral-500 dark:bg-white/10">
                    Soon
                  </span>
                )}
              </span>
            );
          }

          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-white text-neutral-950 shadow-sm ring-1 ring-neutral-200 dark:bg-white/10 dark:text-white dark:ring-white/10"
                  : "text-neutral-600 hover:bg-neutral-200/60 hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-white",
              )}
            >
              <Icon size={16} />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      {/* Profile, pinned to the bottom with flex instead of absolute */}
      <div className="mt-auto border-t border-neutral-200 p-3 dark:border-white/10">
        {profileOpen && (
          <div
            id="profile-menu"
            className="mb-2 rounded-lg border border-neutral-200 bg-white p-1 dark:border-white/10 dark:bg-neutral-950"
          >
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-white/5"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => setProfileOpen((v) => !v)}
          aria-expanded={profileOpen}
          aria-controls="profile-menu"
          className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-neutral-200/60 dark:hover:bg-white/5"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-sm font-semibold text-white dark:bg-white dark:text-neutral-950">
            {userName.charAt(0).toUpperCase() || "?"}
          </span>
          {!collapsed && (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-neutral-950 dark:text-white">
                {userName}
              </span>
              <span className="block truncate text-xs text-neutral-500">
                {userEmail}
              </span>
            </span>
          )}
          <ChevronUp
            size={16}
            className={cn(
              "shrink-0 text-neutral-500 transition-transform",
              profileOpen && "rotate-180",
            )}
          />
        </button>
      </div>
    </>
  );
}

export default function Sidebar({
  userName,
  userEmail,
}: {
  userName: string;
  userEmail: string;
}) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Close the mobile drawer with Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open sidebar"
        className="fixed left-4 top-4 z-40 inline-flex size-10 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-950 shadow-sm dark:border-white/10 dark:bg-neutral-900 dark:text-white md:hidden"
      >
        <Menu size={18} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex shrink-0 flex-col bg-neutral-100 transition-all duration-200 dark:bg-neutral-900 md:static md:translate-x-0",
          collapsed ? "w-16" : "w-64",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close sidebar"
          className="absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-lg text-neutral-500 hover:text-neutral-950 dark:hover:text-white md:hidden"
        >
          <X size={16} />
        </button>

        <SidebarBody
          userName={userName}
          userEmail={userEmail}
          onNavigate={() => setOpen(false)}
          collapsed={collapsed}
        />
      </aside>
    </>
  );
}