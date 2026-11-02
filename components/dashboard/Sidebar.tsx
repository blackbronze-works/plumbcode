"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Home, Settings, GitBranch, Menu, X, LogOut, ChevronUp } from "lucide-react";
import { authClient } from "@/lib/auth-client";

const NAV = [
  { label: "Overview", href: "/dashboard", icon: Home },
  { label: "Repositories", href: "/dashboard/repos", icon: GitBranch },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar({ userName, userEmail }: { userName: string; userEmail: string }) {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = "/";
  };

  const NavContent = () => (
    <>
      <div className="flex items-center gap-2 px-4 py-6">
        <Link href="/" aria-label="Plumbcode home">
          <Image
            src="/img/plumbcode-black.png"
            alt="Plumbcode"
            width={120}
            height={28}
            className="dark:hidden"
            style={{ width: "auto", height: 28 }}
            sizes="120px"
          />
          <Image
            src="/img/plumbcode-white.png"
            alt="Plumbcode"
            width={120}
            height={28}
            className="hidden dark:block"
            style={{ width: "auto", height: 28 }}
            sizes="120px"
          />
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-2 pb-24">
        {NAV.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-200/60 dark:text-neutral-300 dark:hover:bg-white/5"
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-3">
        <button
          type="button"
          onClick={() => setProfileOpen((v) => !v)}
          className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-neutral-200/60 dark:hover:bg-white/5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-950 text-sm font-semibold text-white dark:bg-white dark:text-neutral-950">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-neutral-950 dark:text-white">
              {userName}
            </p>
            <p className="truncate text-xs text-neutral-500">{userEmail}</p>
          </div>
          <ChevronUp
            size={16}
            className={`text-neutral-500 transition-transform ${profileOpen ? "" : "rotate-180"}`}
          />
        </button>

        {profileOpen && (
          <div className="mt-2 rounded-lg border border-neutral-200 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-neutral-900">
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
      </div>
    </>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-40 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 text-neutral-950 shadow-sm dark:border-white/10 dark:bg-neutral-900 dark:text-white md:hidden"
        aria-label="Open sidebar"
      >
        <Menu size={18} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-neutral-100 transition-transform duration-200 dark:bg-neutral-900 md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:text-neutral-950 dark:hover:text-white md:hidden"
          aria-label="Close sidebar"
        >
          <X size={16} />
        </button>
        <NavContent />
      </aside>
    </>
  );
}

