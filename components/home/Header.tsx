"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useSyncExternalStore, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
// import ThemeToggle from "../ThemeToggle";
import { Button } from "../ui/button";
import { GithubIcon } from "../GithubIcon";

const NAV = [
  { label: "Product", href: "#product" },
  { label: "Security", href: "#security" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "/docs" },
];

function subscribeToScroll(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });
  return () => window.removeEventListener("scroll", callback);
}

const getScrolled = () =>
  typeof window !== "undefined" ? window.scrollY > 24 : false;
const getServerScrolled = () => false;

const Header = () => {
  const [open, setOpen] = useState(false);

  const scrolled = useSyncExternalStore(
    subscribeToScroll,
    getScrolled,
    getServerScrolled,
  );

  // Close mobile menu on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.6, duration: 0.6 }}
      className="fixed inset-x-0 top-0 z-50 w-full px-3 pt-3"
    >
      <div
        className={cn(
          "mx-auto grid grid-cols-3 items-center border px-4 py-3 transition-all duration-300 ease-out sm:px-6",
          scrolled
            ? "max-w-6xl rounded-full border-neutral-200/30 bg-white/30 backdrop-blur-sm dark:border-white/10 dark:bg-neutral-950/30"
            : "max-w-7xl rounded-full border-transparent bg-transparent backdrop-blur-none",
        )}
      >
        {/* Section 1: Logo (Left - 1/3 width) */}
        <div className="flex items-center justify-start">
          <Link
            href="/"
            aria-label="Plumbcode home"
            className="flex items-center"
          >
            <Image
              src="/img/plumbcode-black.png"
              alt="Plumbcode"
              width={140}
              height={32}
              priority
              className="h-10 w-auto dark:hidden"
            />
            <Image
              src="/img/plumbcode-white.png"
              alt="Plumbcode"
              width={140}
              height={32}
              priority
              className="hidden h-10 w-auto dark:block"
            />
          </Link>
        </div>

        {/* Section 2: Desktop Navigation (Middle - 1/3 width, centered) */}
        <nav className="hidden items-center justify-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm text-neutral-700 transition-colors hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Section 3: Right Side Actions (Right - 1/3 width, right-aligned) */}
        <div className="col-span-2 flex items-center justify-end gap-2 md:col-span-1">
          {/* <ThemeToggle /> */}

          <Button
            nativeButton={false}
            render={<Link href="/login" />}
            variant="ghost"
            className="hidden h-auto px-3 py-2 text-sm text-neutral-700 transition-colors hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white sm:inline-block"
          >
            Sign in
          </Button>

          <Button
            nativeButton={false}
            render={<Link href="/install" />}
            className="inline-flex items-center gap-2 rounded-full bg-neutral-950 h-auto px-6 py-3 font-sans text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
          >
            <GithubIcon size={18} />
            Install on GitHub
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-900/5 dark:text-neutral-300 dark:hover:bg-white/10 md:hidden"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-neutral-200/80 bg-white/95 p-6 shadow-lg backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/95 md:hidden"
            >
              <div className="flex items-center justify-between">
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  aria-label="Plumbcode home"
                >
                  <Image
                    src="/img/plumbcode-black.png"
                    alt="Plumbcode"
                    width={140}
                    height={32}
                    className="h-8 w-auto dark:hidden"
                  />
                  <Image
                    src="/img/plumbcode-white.png"
                    alt="Plumbcode"
                    width={140}
                    height={32}
                    className="hidden h-8 w-auto dark:block"
                  />
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-900/5 dark:text-neutral-300 dark:hover:bg-white/10"
                >
                  <X size={20} />
                </Button>
              </div>
              <nav className="mt-8 flex flex-col gap-1">
                {NAV.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="py-3 text-sm font-medium text-neutral-700 transition-colors hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-2 border-t border-neutral-200 pt-4 dark:border-neutral-800">
                <Button
                  render={<Link href="/login" onClick={() => setOpen(false)} />}
                  variant="outline"
                  nativeButton={false}
                  className="h-auto rounded-full border-neutral-300 px-4 py-2 text-center text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
                >
                  Sign in
                </Button>
                <Button
                  render={
                    <Link href="/install" onClick={() => setOpen(false)} />
                  }
                  nativeButton={false}
                  className="h-auto rounded-full bg-neutral-950 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
                >
                  <GithubIcon size={18} />
                  Install on GitHub
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
