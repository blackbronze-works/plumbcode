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
        className="mx-auto max-w-6xl rounded-3xl border border-neutral-200 bg-neutral-50 px-6 py-16 text-center dark:border-white/10 dark:bg-neutral-950 sm:px-12 sm:py-24"
      >
        <h2 className="font-barabara mx-auto max-w-3xl text-4xl leading-[1.1] tracking-tight text-neutral-950 dark:text-white sm:text-5xl">
          Hold every pull request to your standards
        </h2>

        <p className="mx-auto mt-6 max-w-xl font-sans text-base leading-relaxed text-neutral-600 dark:text-neutral-400 sm:text-lg">
          Install the GitHub App, add your principles, and see your first
          finding on the next PR.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            nativeButton={false}
            render={<Link href="/install" />}
            className="inline-flex h-auto items-center gap-2 rounded-full bg-neutral-950 px-6 py-3 font-sans text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
          >
            <GithubIcon size={16} />
            Install on GitHub
          </Button>
          <Button
            nativeButton={false}
            render={<Link href="/contact" />}
            className="inline-flex h-auto items-center gap-2 rounded-full border border-neutral-300 bg-white px-6 py-3 font-sans text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-50 dark:border-white/15 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:bg-neutral-900"
          >
            Talk to us
          </Button>
        </div>

        <p className="mt-6 font-sans text-xs text-neutral-500">
          Advisory by default &nbsp;·&nbsp; Minimal GitHub permissions
        </p>
      </motion.div>
    </section>
  );
};

export default CTA;
