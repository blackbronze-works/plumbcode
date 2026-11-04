"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronUp,
  GitBranch,
  Home,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { Button } from "../ui/button";

// ─── Nav config ──────────────────────────────────────────────────────────────

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const NAV: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: Home },
  { label: "Repositories", href: "/dashboard/repos", icon: GitBranch },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

// ─── Collapse persistence ────────────────────────────────────────────────────

const COLLAPSED_KEY = "plumbcode:sidebar-collapsed";
const COLLAPSED_EVENT = "plumbcode:sidebar-collapsed-change";

function subscribeToCollapse(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(COLLAPSED_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(COLLAPSED_EVENT, callback);
  };
}

function getCollapsedSnapshot() {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

// The server always renders the expanded sidebar; React swaps to the stored
// preference after hydration. Reading localStorage during render would throw
// on the server and cause a reload loop.
const getCollapsedServerSnapshot = () => false;

function useCollapsed() {
  const collapsed = useSyncExternalStore(
    subscribeToCollapse,
    getCollapsedSnapshot,
    getCollapsedServerSnapshot,
  );

  const toggle = () => {
    const next = !collapsed;
    try {
      localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0");
      window.dispatchEvent(new Event(COLLAPSED_EVENT));
    } catch {
      /* ignore */
    }
  };

  return { collapsed, toggle };
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

export default function Sidebar({
  userName,
  userEmail,
}: {
  userName: string;
  userEmail: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { collapsed, toggle: toggleCollapse } = useCollapsed();

  // Close profile menu on outside click
  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e: PointerEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [profileOpen]);

  // Escape + body scroll lock for mobile drawer
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile trigger */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open sidebar"
        className="fixed left-5 top-5 z-40 flex size-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-950 shadow-sm md:hidden dark:border-white/10 dark:bg-neutral-900 dark:text-white"
      >
        <Menu size={18} />
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-950/40 md:hidden"
          onClick={closeMobile}
          aria-hidden
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          "py-2 fixed inset-y-0 left-0 z-50 flex w-64 flex-col transition-[transform,width] duration-300 ease-out",
          "md:static md:translate-x-0",
          collapsed ? "md:w-13" : "",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Mobile close */}
        <button
          type="button"
          onClick={closeMobile}
          aria-label="Close sidebar"
          className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 md:hidden dark:hover:bg-white/5"
        >
          <X size={16} />
        </button>

        {/* Brand — collapse toggle joins the row when expanded */}
        <div
          className={cn(
            "flex items-center p-2",
            !collapsed && "justify-between",
          )}
        >
          <Link
            href="/"
            aria-label="Plumbcode home"
            className="size-9 flex-center shrink-0"
          >
            <Image
              src="/img/plumbcode-black.png"
              alt="Plumbcode"
              width={120}
              height={28}
              priority
              className="h-7 w-auto dark:hidden"
            />
            <Image
              src="/img/plumbcode-white.png"
              alt="Plumbcode"
              width={120}
              height={28}
              priority
              className="hidden h-7 w-auto dark:block"
            />
          </Link>

          {!collapsed && (
            <Button
              variant="ghost"
              size="icon-lg"
              onClick={toggleCollapse}
              aria-label="Collapse sidebar"
            >
              <PanelLeftOpen size={18} strokeWidth={2.5} />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav aria-label="Dashboard" className="flex flex-col gap-1 p-2">
          {/* Workspace label + line — label hides when collapsed, row height stays constant */}
          <div className="mb-1 flex h-4 items-center gap-2">
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -4 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 whitespace-nowrap"
                >
                  Workspace
                </motion.span>
              )}
            </AnimatePresence>
            <span className="h-px flex-1 bg-neutral-200 dark:bg-white/10" />
          </div>

          {NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobile}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex h-9 shrink-0 items-center rounded-md text-sm font-medium transition-colors overflow-hidden",
                  !collapsed && "gap-3 pr-2",
                  active
                    ? "bg-neutral-200/70 text-neutral-950 dark:bg-white/10 dark:text-white"
                    : "text-neutral-600 hover:bg-neutral-200/60 hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-white",
                )}
              >
                {/* Fixed icon frame — identical geometry in both states */}
                <span className="flex size-9 shrink-0 items-center justify-center">
                  <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                </span>

                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="min-w-0 truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Collapsed tooltip */}
                {collapsed && (
                  <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-neutral-950 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-white dark:text-neutral-950">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />

        {/* Expand sidebar (collapsed only) */}
        <AnimatePresence initial={false}>
          {collapsed && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="p-2"
            >
              <Button
                variant="ghost"
                size="icon-lg"
                onClick={toggleCollapse}
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose size={18} strokeWidth={2.5} />
                <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-neutral-950 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-white dark:text-neutral-950">
                  Expand
                </span>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Early access (expanded only) */}
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="mx-2 mb-2 rounded-xl border border-neutral-200/80 bg-neutral-50/80 p-3 dark:border-white/10 dark:bg-white/5"
            >
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                <Sparkles size={12} />
                Early access
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                Plumbcode is taking shape — new pages ship weekly.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile */}
        <div
          ref={profileRef}
          className={cn(
            "flex relative border-t border-neutral-200 dark:border-white/10 p-1",
          )}
        >
          {profileOpen && (
            <div
              className={cn(
                "absolute bottom-full z-50 mb-2 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg dark:border-white/10 dark:bg-neutral-900",
                collapsed ? "left-full ml-2 w-56" : "left-1 right-1",
              )}
            >
              <div className="border-b border-neutral-100 px-3 py-2.5 dark:border-white/5">
                <p className="truncate text-sm font-medium text-neutral-950 dark:text-white">
                  {userName}
                </p>
                <p className="truncate text-xs text-neutral-500">{userEmail}</p>
              </div>
              <div className="p-1">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-white/5"
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setProfileOpen((v) => !v)}
            aria-expanded={profileOpen}
            className={cn(
              "flex flex-1 items-center rounded-md text-left transition-colors hover:bg-neutral-100 dark:hover:bg-white/5 p-1 gap-2 overflow-hidden",
            )}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-neutral-600 to-neutral-950 text-sm font-semibold text-white ring-2 ring-white dark:from-neutral-300 dark:to-neutral-500 dark:text-neutral-950 dark:ring-neutral-900">
              {userName.charAt(0).toUpperCase() || "?"}
            </span>

            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="min-w-0 flex-1 flex items-center gap-1"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-neutral-950 dark:text-white">
                      {userName}
                    </span>
                    <span className="block truncate text-xs text-neutral-500">
                      {userEmail}
                    </span>
                  </span>
                  <div className="size-6 flex-center">
                    <ChevronUp
                      size={18}
                      className={cn(
                        "shrink-0 text-neutral-400 transition-transform",
                        profileOpen && "rotate-180",
                      )}
                    />
                  </div>
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </aside>
    </>
  );
}
