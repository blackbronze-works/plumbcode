"use client";

import { motion } from "framer-motion";
import { Clock, FileText, Shuffle } from "lucide-react";

const PROBLEMS = [
  {
    icon: FileText,
    title: "Rules nobody reads",
    body: "Your standards sit in a wiki or a CONTRIBUTING file. New hires skim them once, and reviewers can't be expected to remember every line.",
  },
  {
    icon: Shuffle,
    title: "Reviews that vary by reviewer",
    body: "One reviewer enforces naming conventions, another cares about commit messages, a third is rushing. The same PR gets different feedback depending on who picks it up.",
  },
  {
    icon: Clock,
    title: "Violations found too late",
    body: "A commit message that doesn't match the diff, or a rule quietly broken, gets noticed in an incident review rather than in the PR where it was cheap to fix.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

const Problem = () => {
  return (
    <section id="problem" className="relative px-4 py-32 sm:px-6 sm:py-40">
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <div className="mx-auto max-w-4xl text-center">
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="font-sans text-xs font-medium uppercase tracking-widest text-neutral-500"
          >
            The problem
          </motion.p>

          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-barabara mt-4 text-5xl leading-[1.05] tracking-tight text-neutral-950 dark:text-white sm:text-6xl"
          >
            Your standards are written down. Your PRs don&rsquo;t follow them.
          </motion.h2>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 font-sans text-base leading-relaxed text-neutral-600 dark:text-neutral-400 sm:text-lg"
          >
            Human review is where standards are supposed to be enforced, but it
            doesn&rsquo;t scale with the team, and it&rsquo;s never consistent.
          </motion.p>
        </div>

        {/* Cards */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {PROBLEMS.map((item, i) => (
            <motion.div
              key={item.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, delay: 0.2 + i * 0.12 }}
              className="group rounded-2xl border border-neutral-200 bg-white p-8 transition-transform hover:-translate-y-1 dark:border-white/10 dark:bg-neutral-950 sm:p-10"
            >
              <div className="inline-flex size-12 items-center justify-center rounded-full border border-neutral-200 bg-primary/10 text-primary dark:border-white/10 dark:bg-primary/20">
                <item.icon size={20} />
              </div>

              <h3 className="mt-6 font-sans text-lg font-semibold tracking-tight text-neutral-950 dark:text-white">
                {item.title}
              </h3>

              <p className="mt-3 font-sans text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                {item.body}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Bridge to the next section */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="font-barabara mx-auto mt-16 max-w-2xl text-center text-3xl leading-snug text-neutral-950 dark:text-white sm:text-4xl"
        >
          Plumbcode makes the standard something every PR is checked against
          automatically.
        </motion.p>
      </div>
    </section>
  );
};

export default Problem;
