"use client";

import { motion } from "framer-motion";

const PROBLEMS = [
  {
    title: "Rules nobody reads",
    body: "Your standards sit in a wiki or a CONTRIBUTING file. New hires skim them once, and reviewers can't be expected to remember every line.",
  },
  {
    title: "Reviews that vary by reviewer",
    body: "One reviewer enforces naming conventions, another cares about commit messages, a third is rushing. The same PR gets different feedback depending on who picks it up.",
  },
  {
    title: "Violations found too late",
    body: "A commit message that doesn't match the diff, or a rule quietly broken, gets noticed in an incident review rather than in the PR where it was cheap to fix.",
  },
];

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

const Problem = () => {
  return (
    <section id="problem" className="px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.35fr] lg:gap-20">
          {/* Left — sticky editorial column */}
          <div className="self-start lg:sticky lg:top-28">
            <motion.p
              {...reveal}
              transition={{ duration: 0.7 }}
              className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-brand"
            >
              01 &middot; The problem
            </motion.p>

            <motion.h2
              {...reveal}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-barabara mt-4 text-4xl leading-[1.05] tracking-tight text-neutral-950 dark:text-white sm:text-5xl"
            >
              Your standards are written down. Your PRs don&rsquo;t follow them.
            </motion.h2>

            <motion.p
              {...reveal}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-6 font-sans text-base leading-relaxed text-neutral-600 dark:text-neutral-400"
            >
              Human review is where standards are supposed to be enforced, but
              it doesn&rsquo;t scale with the team, and it&rsquo;s never
              consistent.
            </motion.p>

            {/* Pull-quote bridge */}
            <motion.blockquote
              {...reveal}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-10 border-l-2 border-brand pl-5 dark:border-brand"
            >
              <p className="font-sans text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
                Plumbcode makes the standard something every PR is checked
                against{" "}
                <span className="font-medium text-brand">
                  automatically
                </span>
                .
              </p>
            </motion.blockquote>
          </div>

          {/* Right — numbered hairline rows */}
          <div>
            {PROBLEMS.map((item, i) => (
              <motion.div
                key={item.title}
                {...reveal}
                transition={{ duration: 0.7, delay: 0.15 + i * 0.1 }}
                className={`group flex items-start gap-6 border-t border-neutral-200 py-10 dark:border-white/10 sm:gap-10 ${
                  i === PROBLEMS.length - 1 ? "border-b" : ""
                }`}
              >
                <span
                  aria-hidden
                  className="font-barabara text-4xl leading-none text-brand/20 transition-colors duration-300 group-hover:text-brand dark:text-brand/25 sm:text-6xl"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="pt-1.5">
                  <h3 className="font-sans text-lg font-semibold tracking-tight text-neutral-950 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-3 max-w-md font-sans text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    {item.body}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Problem;
