"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Plus } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

const reveal = {
  variants: fadeUp,
  initial: "hidden",
  whileInView: "visible",
  viewport: { once: true, margin: "-80px" },
} as const;

const FAQS = [
  {
    q: "Will Plumbcode block our merges?",
    a: "No. Plumbcode is advisory. It posts a check run and a comment with its findings, and the PR can still be merged. Blocking is something we'd only offer as an opt-in once teams trust the results.",
  },
  {
    q: "Do you store our code?",
    a: "Plumbcode reads the diff and commit messages to produce findings, then discards them. We store the results (which rule, which file, which outcome), not your source. The Security section above lists exactly what we access.",
  },
  {
    q: "How is this different from other AI code reviewers?",
    a: "Most tools give general feedback. Plumbcode checks against rules you wrote, and every finding cites the rule it came from and the exact lines. It also compares each commit message with what the diff actually does.",
  },
  {
    q: "We don't have written standards yet. Can we still use it?",
    a: "Yes, but the value comes from having rules, so you'll want to start with a handful. Begin with three to five that your team already agrees on, and add more as you see what gets flagged.",
  },
  {
    q: "What about false positives?",
    a: "Every finding can be dismissed, and Plumbcode tracks how often each rule is dismissed. A rule that's dismissed constantly usually needs rewriting, and the review history shows you which ones.",
  },
  {
    q: "Which languages and Git hosts are supported?",
    a: "Plumbcode reads diffs, so it isn't tied to a language. For now it works with GitHub only. GitLab and Bitbucket aren't available yet.",
  },
];

const FAQ = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.35fr] lg:gap-20">
          {/* Left — sticky editorial column */}
          <div className="self-start lg:sticky lg:top-28">
            <motion.p
              {...reveal}
              transition={{ duration: 0.7 }}
              className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-brand"
            >
              06 &middot; FAQ
            </motion.p>

            <motion.h2
              {...reveal}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-barabara mt-4 text-4xl leading-[1.1] tracking-tight text-neutral-950 dark:text-white sm:text-5xl"
            >
              Questions teams ask before installing
            </motion.h2>

            <motion.div
              {...reveal}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-8"
            >
              <p className="font-sans text-sm text-neutral-600 dark:text-neutral-400">
                Still have questions?
              </p>
              <Link
                href="/contact"
                className="group mt-2 inline-flex items-center gap-2 font-sans text-sm font-medium text-brand underline-offset-4 hover:text-brand/80 hover:underline"
              >
                Talk to us
                <ArrowRight
                  size={14}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </motion.div>
          </div>

          {/* Right — hairline accordion */}
          <motion.div
            {...reveal}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="divide-y divide-neutral-200 border-y border-neutral-200 dark:divide-white/10 dark:border-white/10"
          >
            {FAQS.map((item, i) => {
              const isOpen = open === i;
              return (
                <div key={item.q}>
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  >
                    <span className="font-sans text-base font-medium text-neutral-950 dark:text-white">
                      {item.q}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.2 }}
                      className={`shrink-0 transition-colors duration-200 ${
                        isOpen ? "text-brand" : "text-neutral-500"
                      }`}
                    >
                      <Plus size={16} />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-2xl pb-6 font-sans text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
