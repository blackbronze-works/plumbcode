"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { GithubIcon } from "../GithubIcon";

const CTA = () => {
  return (
    <section className="relative px-4 pb-24 sm:px-6 sm:pb-32">
      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8 }}
        className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-brand/30 bg-linear-to-br from-brand-soft to-brand/10 px-6 py-16 text-center shadow-[0_24px_70px_-40px_var(--brand-glow)] sm:px-12 sm:py-24 dark:bg-none dark:bg-neutral-950 dark:shadow-[0_50px_140px_-80px_var(--brand-glow)]"
      >
        {/* Decorative layers */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.06)_1px,transparent_0)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_40%,black,transparent_80%)] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.12)_1px,transparent_0)]" />
          <div className="absolute -top-40 left-1/2 h-96 w-[42rem] max-w-[130vw] -translate-x-1/2 rounded-full bg-brand/25 blur-[110px]" />
          <div className="absolute -bottom-28 right-0 size-72 rounded-full bg-teal-500/15 blur-[100px]" />
          <div className="absolute -left-24 top-1/3 size-64 rounded-full bg-emerald-500/10 blur-[100px]" />
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brand/70 to-transparent" />
        </div>

        <div className="relative">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 font-sans text-[11px] font-medium uppercase tracking-widest text-brand dark:border-white/10 dark:bg-white/5 dark:text-emerald-300">
            <span className="size-1 rounded-full bg-brand dark:bg-emerald-300" />
            Get started
          </p>

          <h2 className="font-barabara mx-auto mt-6 max-w-3xl text-4xl leading-[1.1] tracking-tight text-neutral-950 dark:text-white sm:text-5xl">
            Hold every pull request to{" "}
            <span className="bg-linear-to-r from-brand to-emerald-600 bg-clip-text text-transparent dark:from-emerald-300 dark:to-teal-200">
              your standards
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl font-sans text-base leading-relaxed text-neutral-600 sm:text-lg dark:text-neutral-400">
            Install the GitHub App, add your principles, and see your first
            finding on the next PR.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              nativeButton={false}
              render={<Link href="/install" />}
              className="brand-glow inline-flex h-auto items-center gap-2 rounded-full bg-brand px-6 py-3 font-sans text-sm font-medium text-brand-foreground transition-all hover:bg-brand/90"
            >
              <GithubIcon size={16} />
              Install on GitHub
            </Button>
            <Button
              nativeButton={false}
              render={<Link href="/contact" />}
              className="inline-flex h-auto items-center gap-2 rounded-full border border-neutral-300 bg-white/70 px-6 py-3 font-sans text-sm font-medium text-neutral-800 transition-colors hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              Talk to us
            </Button>
          </div>

          <p className="mt-6 font-sans text-xs text-neutral-500">
            Advisory by default &nbsp;·&nbsp; Minimal GitHub permissions
          </p>
        </div>
      </motion.div>
    </section>
  );
};

export default CTA;
