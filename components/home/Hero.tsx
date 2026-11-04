"use client";

import Link from "next/link";
import { ArrowRight, Check, GitBranch, TriangleAlert } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { GithubIcon } from "../GithubIcon";

const FINDINGS = [
  {
    title: "Direct database access in a route handler",
    rule: "R-02",
    file: "app/api/export/route.ts",
  },
  {
    title: "New endpoint has no test",
    rule: "R-03",
    file: "app/api/export/route.ts",
  },
];

const HeroPreview = () => (
  <div className="relative">
    {/* Aura behind the window */}
    <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-[radial-gradient(ellipse_65%_70%_at_50%_35%,var(--brand-glow),transparent_70%)] opacity-70 blur-2xl" />

    <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white/85 shadow-2xl shadow-neutral-900/10 dark:border-white/10 dark:bg-neutral-950/85 dark:shadow-black/60">
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-neutral-200 px-4 py-3 dark:border-white/10">
        <span className="size-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
        <span className="size-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
        <span className="size-2.5 rounded-full bg-brand/70" />
        <span className="ml-3 flex min-w-0 items-center gap-1.5 font-mono text-xs text-neutral-500">
          <GitBranch size={12} className="shrink-0" />
          <span className="truncate">acme/api &middot; pull/128</span>
        </span>
        <span className="ml-auto hidden items-center gap-1.5 rounded-full border border-brand-border bg-brand-soft px-2.5 py-1 font-sans text-[11px] font-medium text-brand sm:inline-flex">
          <Check size={11} strokeWidth={3} />
          Check run
        </span>
      </div>

      {/* Body */}
      <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Summary */}
        <div className="border-b border-neutral-200 p-5 dark:border-white/10 lg:border-b-0 lg:border-r sm:p-6">
          <p className="font-sans text-xs font-medium uppercase tracking-widest text-brand">
            Review summary
          </p>
          <h3 className="mt-3 font-sans text-base font-semibold tracking-tight text-neutral-950 dark:text-white">
            Add user export endpoint
          </h3>
          <p className="mt-1 font-sans text-xs text-neutral-500">
            3 files changed &middot; +64 &minus;12
          </p>

          <div className="mt-5 space-y-2.5">
            {FINDINGS.map((f) => (
              <div
                key={f.title}
                className="flex items-start gap-2.5 rounded-lg border border-neutral-200 bg-neutral-50/70 p-3 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <TriangleAlert
                  size={14}
                  className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
                />
                <div className="min-w-0">
                  <p className="font-sans text-xs font-medium text-neutral-900 dark:text-neutral-100">
                    {f.title}
                  </p>
                  <p className="mt-0.5 font-sans text-[11px] text-neutral-500">
                    Violates{" "}
                    <span className="font-mono font-medium text-brand">
                      {f.rule}
                    </span>{" "}
                    &middot; {f.file}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-2 font-sans text-[11px] text-neutral-500">
            <span className="flex size-4 items-center justify-center rounded-full bg-brand/15 text-brand">
              <Check size={10} strokeWidth={3} />
            </span>
            Advisory &mdash; this PR can still be merged
          </div>
        </div>

        {/* Diff detail */}
        <div className="p-5 sm:p-6">
          <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-white/10">
            <div className="flex items-center justify-between gap-3 border-b border-neutral-200 px-3 py-2 dark:border-white/10">
              <span className="truncate font-mono text-[11px] text-neutral-600 dark:text-neutral-400">
                app/api/export/route.ts
              </span>
              <span className="shrink-0 font-mono text-[11px] font-medium text-brand">
                R-02
              </span>
            </div>
            <pre className="overflow-x-auto p-3 font-mono text-[11px] leading-relaxed text-neutral-700 dark:text-neutral-300">
              <code>
                <span className="block text-neutral-400 dark:text-neutral-600">
                  {"+ export async function GET() {"}
                </span>
                <span className="block bg-red-500/10 px-2 text-red-700 dark:text-red-400">
                  {"-   const rows = await prisma.user.findMany()"}
                </span>
                <span className="block bg-emerald-500/10 px-2 text-emerald-700 dark:text-emerald-400">
                  {"+   const rows = await getUsers()"}
                </span>
                <span className="block text-neutral-400 dark:text-neutral-600">
                  {"+   return Response.json(rows)"}
                </span>
                <span className="block text-neutral-400 dark:text-neutral-600">
                  {"+ }"}
                </span>
              </code>
            </pre>
          </div>

          <p className="mt-3 font-sans text-[11px] leading-relaxed text-neutral-500">
            Direct database access belongs in the data layer. Use{" "}
            <span className="font-mono text-neutral-700 dark:text-neutral-300">
              /lib/db
            </span>{" "}
            instead of calling Prisma from a route handler.
          </p>

          <span className="mt-4 inline-flex items-center gap-1.5 font-sans text-[11px] font-medium text-brand">
            See the cited rule
            <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </div>
  </div>
);

const Hero = () => {
  return (
    <section className="relative isolate flex min-h-screen flex-col items-center overflow-hidden px-4 pb-24 pt-28 sm:px-6 sm:pt-36">
      {/* Decorative background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="dot-grid absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_65%_55%_at_50%_0%,black_20%,transparent_75%)]" />
        <div className="absolute left-1/2 top-16 h-[28rem] w-[52rem] max-w-[130vw] -translate-x-1/2 rounded-full bg-brand/15 blur-[120px] dark:bg-brand/10" />
        <div className="absolute left-[8%] top-[42%] size-72 rounded-full bg-teal-400/10 blur-[100px] dark:bg-teal-400/10" />
        <div className="absolute right-[6%] top-[30%] size-72 rounded-full bg-emerald-400/10 blur-[100px] dark:bg-emerald-500/10" />
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <Link
          href="#how-it-works"
          className="group mb-8 inline-flex max-w-full items-center gap-1.5 rounded-full border border-brand-border bg-brand-soft/70 px-3 py-1.5 text-xs text-brand transition-colors hover:border-brand/50 hover:bg-brand-soft dark:bg-brand-soft/40 sm:gap-2 sm:px-4 sm:text-sm"
        >
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand/60" />
            <span className="relative inline-flex size-1.5 rounded-full bg-brand" />
          </span>
          Plumbcode - GitHub App for engineering teams
          <ArrowRight
            size={14}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </motion.div>

      {/* Title: display font */}
      <motion.h1
        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 0.65, duration: 0.8 }}
        className="font-barabara max-w-4xl text-center text-5xl leading-[1.05] tracking-tight text-neutral-950 dark:text-white sm:text-6xl md:text-7xl"
      >
        Every pull request,{" "}
        <span className="text-brand-gradient">held to your standards</span>
      </motion.h1>

      {/* Subtitle: body font */}
      <motion.p
        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="mt-6 max-w-2xl text-center font-sans text-base leading-relaxed text-neutral-600 dark:text-neutral-400 sm:text-lg"
      >
        Plumbcode checks each PR against your team&rsquo;s written principles
        and flags where the code or commit message doesn&rsquo;t hold up, citing
        the exact rule and the exact lines.
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 0.95, duration: 0.8 }}
        className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
      >
        <Button
          nativeButton={false}
          render={<Link href="/install" />}
          className="brand-glow inline-flex items-center gap-2 rounded-full bg-brand h-auto px-6 py-3 font-sans text-sm font-medium text-brand-foreground transition-all hover:bg-brand/90"
        >
          <GithubIcon size={16} />
          Install on GitHub
        </Button>
        <Button
          nativeButton={false}
          render={<Link href="#how-it-works" />}
          className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white h-auto px-6 py-3 font-sans text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-50 dark:border-white/15 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:bg-neutral-900"
        >
          See how it works
        </Button>
      </motion.div>

      {/* Trust line */}
      <motion.p
        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 1.1, duration: 0.8 }}
        className="mt-6 font-sans text-xs text-neutral-500"
      >
        Advisory by default &nbsp;·&nbsp; Minimal GitHub permissions
        &nbsp;·&nbsp; Set up in minutes
      </motion.p>

      {/* Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 1.3, duration: 0.8 }}
        className="mt-16 w-full max-w-5xl"
      >
        <HeroPreview />
      </motion.div>
    </section>
  );
};

export default Hero;
