"use client";

import { motion } from "framer-motion";
import { Check, TriangleAlert } from "lucide-react";
import { GithubIcon } from "../GithubIcon";

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

/* ---------- Step visuals ---------- */

const InstallVisual = () => (
  <div className="w-full rounded-xl border border-neutral-200 bg-white p-5 dark:border-white/10 dark:bg-neutral-950">
    <div className="flex items-center gap-3 border-b border-neutral-200 pb-4 dark:border-white/10">
      <div className="flex size-9 items-center justify-center rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950">
        <GithubIcon size={18} />
      </div>
      <div>
        <p className="font-sans text-sm font-medium text-neutral-950 dark:text-white">
          Install Plumbcode
        </p>
        <p className="font-sans text-xs text-neutral-500">
          on your organization
        </p>
      </div>
    </div>

    <p className="mt-4 font-sans text-xs font-medium uppercase tracking-widest text-neutral-500">
      Repositories
    </p>
    <div className="mt-2 space-y-2">
      {[
        { name: "acme/api", on: true },
        { name: "acme/web", on: true },
        { name: "acme/infra", on: false },
      ].map((repo) => (
        <div
          key={repo.name}
          className="flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2 dark:border-white/10"
        >
          <span className="font-mono text-xs text-neutral-800 dark:text-neutral-200">
            {repo.name}
          </span>
          <span
            className={`flex size-5 items-center justify-center rounded-full ${
              repo.on
                ? "bg-emerald-500 text-white"
                : "border border-neutral-300 dark:border-white/20"
            }`}
          >
            {repo.on && <Check size={12} strokeWidth={3} />}
          </span>
        </div>
      ))}
    </div>

    <div className="mt-4 rounded-lg bg-neutral-50 px-3 py-2 font-sans text-xs text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400">
      Read pull requests &middot; Read commits &middot; Write check runs
    </div>
  </div>
);

const PrinciplesVisual = () => (
  <div className="w-full overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-white/10 dark:bg-neutral-950">
    <div className="flex items-center gap-2 border-b border-neutral-200 px-4 py-3 dark:border-white/10">
      <span className="font-mono text-xs text-neutral-600 dark:text-neutral-400">
        principles.md
      </span>
    </div>
    <pre className="overflow-x-auto p-5 font-mono text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">
      <code>
        <span className="text-neutral-400">## </span>
        <span className="text-emerald-600 dark:text-emerald-400">R-01</span>
        {" Commit messages describe the change\n"}
        <span className="text-neutral-500">
          {"The message must match what the diff does.\n\n"}
        </span>
        <span className="text-neutral-400">## </span>
        <span className="text-emerald-600 dark:text-emerald-400">R-02</span>
        {" No direct database access in route handlers\n"}
        <span className="text-neutral-500">
          {"Use the data layer in /lib/db instead.\n\n"}
        </span>
        <span className="text-neutral-400">## </span>
        <span className="text-emerald-600 dark:text-emerald-400">R-03</span>
        {" Every new endpoint has a test\n"}
        <span className="text-neutral-500">
          {"Add or update a file under /tests."}
        </span>
      </code>
    </pre>
  </div>
);

const FindingVisual = () => (
  <div className="w-full rounded-xl border border-neutral-200 bg-white p-5 dark:border-white/10 dark:bg-neutral-950">
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate font-sans text-sm font-medium text-neutral-950 dark:text-white">
          Add user export endpoint
        </p>
        <p className="font-sans text-xs text-neutral-500">
          #128 &middot; acme/api
        </p>
      </div>
      <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 font-sans text-xs font-medium text-amber-700 dark:text-amber-400">
        1 finding
      </span>
    </div>

    <div className="mt-4 rounded-lg border border-neutral-200 dark:border-white/10">
      <div className="flex items-start gap-2 border-b border-neutral-200 px-3 py-3 dark:border-white/10">
        <TriangleAlert
          size={16}
          className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
        />
        <div>
          <p className="font-sans text-sm font-medium text-neutral-950 dark:text-white">
            Direct database access in a route handler
          </p>
          <p className="mt-0.5 font-sans text-xs text-neutral-500">
            Violates{" "}
            <span className="font-mono text-emerald-600 dark:text-emerald-400">
              R-02
            </span>{" "}
            &middot; app/api/export/route.ts
          </p>
        </div>
      </div>

      <pre className="overflow-x-auto p-3 font-mono text-xs leading-relaxed">
        <code>
          <span className="block bg-red-500/10 px-2 text-red-700 dark:text-red-400">
            {"- const rows = await prisma.user.findMany()"}
          </span>
          <span className="block bg-emerald-500/10 px-2 text-emerald-700 dark:text-emerald-400">
            {"+ const rows = await getUsers()"}
          </span>
        </code>
      </pre>
    </div>

    <p className="mt-3 font-sans text-xs text-neutral-500">
      Advisory &middot; the PR can still be merged
    </p>
  </div>
);

/* ---------- Steps ---------- */

const STEPS = [
  {
    number: "01",
    title: "Install the GitHub App",
    body: "Pick the repositories you want covered. Plumbcode asks for the minimum permissions it needs to read a PR and post a check run, nothing more.",
    visual: <InstallVisual />,
  },
  {
    number: "02",
    title: "Write down your principles",
    body: "Paste or upload your standards as Markdown. Give each rule an ID so every finding can point back to exactly the rule it came from.",
    visual: <PrinciplesVisual />,
  },
  {
    number: "03",
    title: "Get findings on every PR",
    body: "Each pull request is checked against your rules. Findings cite the rule and the exact lines, so a developer can accept or dismiss them in seconds.",
    visual: <FindingVisual />,
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="relative px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.p
            {...reveal}
            transition={{ duration: 0.7 }}
            className="font-sans text-xs font-medium uppercase tracking-widest text-neutral-500"
          >
            How it works
          </motion.p>

          <motion.h2
            {...reveal}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-barabara mt-4 text-4xl leading-[1.1] tracking-tight text-neutral-950 dark:text-white sm:text-5xl"
          >
            From install to first finding in minutes
          </motion.h2>

          <motion.p
            {...reveal}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 font-sans text-base leading-relaxed text-neutral-600 dark:text-neutral-400 sm:text-lg"
          >
            Three steps, no pipeline changes, and nothing to host.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="relative mt-20">
          {/* Timeline line (desktop) */}
          <div className="absolute bottom-0 left-1/2 top-0 hidden w-px -translate-x-1/2 bg-neutral-200 dark:bg-white/10 md:block" />

          <div className="space-y-16 md:space-y-24">
            {STEPS.map((step, i) => {
              const flipped = i % 2 === 1;
              return (
                <motion.div
                  key={step.number}
                  {...reveal}
                  transition={{ duration: 0.8 }}
                  className="relative grid items-center gap-8 md:grid-cols-2 md:gap-20"
                >
                  {/* Number marker on the timeline */}
                  <div className="absolute left-1/2 top-1/2 z-10 hidden size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white font-barabara text-sm text-neutral-950 dark:border-white/10 dark:bg-neutral-950 dark:text-white md:flex">
                    {step.number}
                  </div>

                  {/* Text */}
                  <div className={flipped ? "md:order-2" : ""}>
                    <span className="font-barabara text-sm text-neutral-400 md:hidden">
                      {step.number}
                    </span>
                    <h3 className="mt-1 font-barabara text-3xl leading-tight tracking-tight text-neutral-950 dark:text-white md:mt-0">
                      {step.title}
                    </h3>
                    <p className="mt-4 max-w-md font-sans text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
                      {step.body}
                    </p>
                  </div>

                  {/* Visual */}
                  <div className={flipped ? "md:order-1" : ""}>
                    {step.visual}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
