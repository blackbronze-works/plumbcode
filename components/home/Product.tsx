"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GitCommit, History, ScrollText, TriangleAlert } from "lucide-react";

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

/* ---------- Mock views ---------- */

const RuleView = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate font-sans text-sm font-medium text-neutral-950 dark:text-white">
          Add user export endpoint
        </p>
        <p className="font-sans text-xs text-neutral-500">
          #128 &middot; acme/api &middot; 3 files changed
        </p>
      </div>
      <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 font-sans text-xs font-medium text-amber-700 dark:text-amber-400">
        2 findings
      </span>
    </div>

    {[
      {
        title: "Direct database access in a route handler",
        rule: "R-02",
        file: "app/api/export/route.ts",
        removed: "const rows = await prisma.user.findMany()",
        added: "const rows = await getUsers()",
      },
      {
        title: "New endpoint has no test",
        rule: "R-03",
        file: "app/api/export/route.ts",
        removed: null,
        added: "// add tests/export.test.ts",
      },
    ].map((f) => (
      <div
        key={f.title}
        className="rounded-lg border border-neutral-200 dark:border-white/10"
      >
        <div className="flex items-start gap-2 border-b border-neutral-200 px-3 py-3 dark:border-white/10">
          <TriangleAlert
            size={16}
            className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
          />
          <div>
            <p className="font-sans text-sm font-medium text-neutral-950 dark:text-white">
              {f.title}
            </p>
            <p className="mt-0.5 font-sans text-xs text-neutral-500">
              Violates{" "}
              <span className="font-mono text-emerald-600 dark:text-emerald-400">
                {f.rule}
              </span>{" "}
              &middot; {f.file}
            </p>
          </div>
        </div>
        <pre className="overflow-x-auto p-3 font-mono text-xs leading-relaxed">
          <code>
            {f.removed && (
              <span className="block bg-red-500/10 px-2 text-red-700 dark:text-red-400">
                {"- " + f.removed}
              </span>
            )}
            <span className="block bg-emerald-500/10 px-2 text-emerald-700 dark:text-emerald-400">
              {"+ " + f.added}
            </span>
          </code>
        </pre>
      </div>
    ))}
  </div>
);

const CommitView = () => (
  <div className="space-y-4">
    <p className="font-sans text-xs font-medium uppercase tracking-widest text-neutral-500">
      Commit vs. diff
    </p>

    <div className="rounded-lg border border-neutral-200 p-4 dark:border-white/10">
      <div className="flex items-center gap-2">
        <GitCommit size={16} className="text-neutral-500" />
        <span className="font-mono text-xs text-neutral-500">a41f9c2</span>
      </div>
      <p className="mt-2 font-mono text-sm text-neutral-950 dark:text-white">
        fix: update button color on pricing page
      </p>
    </div>

    <div className="rounded-lg border border-neutral-200 dark:border-white/10">
      <p className="border-b border-neutral-200 px-3 py-2 font-sans text-xs text-neutral-500 dark:border-white/10">
        What the diff actually changes
      </p>
      <ul className="space-y-1 p-3 font-mono text-xs">
        <li className="text-neutral-700 dark:text-neutral-300">
          <span className="text-emerald-600 dark:text-emerald-400">+</span>{" "}
          components/pricing/Button.tsx{" "}
          <span className="text-neutral-500">(color token)</span>
        </li>
        <li className="text-neutral-700 dark:text-neutral-300">
          <span className="text-red-600 dark:text-red-400">&plusmn;</span>{" "}
          middleware.ts{" "}
          <span className="text-neutral-500">(session check removed)</span>
        </li>
      </ul>
    </div>

    <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
      <TriangleAlert
        size={16}
        className="mt-0.5 shrink-0 text-amber-700 dark:text-amber-400"
      />
      <p className="font-sans text-sm text-neutral-800 dark:text-neutral-200">
        The message doesn&rsquo;t mention the change to{" "}
        <span className="font-mono text-xs">middleware.ts</span>. Violates{" "}
        <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400">
          R-01
        </span>
        .
      </p>
    </div>
  </div>
);

const HistoryView = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <p className="font-sans text-xs font-medium uppercase tracking-widest text-neutral-500">
        Violations by rule &middot; last 30 days
      </p>
    </div>

    <div className="space-y-3">
      {[
        {
          rule: "R-03",
          name: "Every new endpoint has a test",
          count: 14,
          pct: 100,
        },
        {
          rule: "R-02",
          name: "No direct DB access in handlers",
          count: 9,
          pct: 64,
        },
        {
          rule: "R-01",
          name: "Commit messages describe the change",
          count: 6,
          pct: 43,
        },
        { rule: "R-05", name: "No secrets in config files", count: 1, pct: 8 },
      ].map((r) => (
        <div key={r.rule}>
          <div className="flex items-center justify-between gap-3">
            <p className="min-w-0 truncate font-sans text-sm text-neutral-800 dark:text-neutral-200">
              <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400">
                {r.rule}
              </span>{" "}
              {r.name}
            </p>
            <span className="shrink-0 font-mono text-xs text-neutral-500">
              {r.count}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-900">
            <div
              className="h-full rounded-full bg-neutral-950 dark:bg-white"
              style={{ width: `${r.pct}%` }}
            />
          </div>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-2 gap-3 pt-2">
      <div className="rounded-lg border border-neutral-200 p-3 dark:border-white/10">
        <p className="font-sans text-xs text-neutral-500">Findings dismissed</p>
        <p className="mt-1 font-barabara text-2xl text-neutral-950 dark:text-white">
          18%
        </p>
      </div>
      <div className="rounded-lg border border-neutral-200 p-3 dark:border-white/10">
        <p className="font-sans text-xs text-neutral-500">
          PRs with no findings
        </p>
        <p className="mt-1 font-barabara text-2xl text-neutral-950 dark:text-white">
          71%
        </p>
      </div>
    </div>
  </div>
);

/* ---------- Tabs ---------- */

const TABS = [
  {
    id: "rules",
    icon: ScrollText,
    title: "Findings that cite the rule",
    body: "Every finding points to the exact principle it came from and the exact lines of the diff. Developers can accept or dismiss it in seconds.",
    view: <RuleView />,
    window: "Pull request #128",
  },
  {
    id: "commits",
    icon: GitCommit,
    title: "Commit messages that match the code",
    body: "Plumbcode compares what a commit says with what the diff actually does, and flags changes the message leaves out.",
    view: <CommitView />,
    window: "Commit check",
  },
  {
    id: "history",
    icon: History,
    title: "Violation history per rule",
    body: "See which rules are broken most, how often findings are dismissed, and whether a rule is worth keeping or rewriting.",
    view: <HistoryView />,
    window: "Review history",
  },
];

const Product = () => {
  const [active, setActive] = useState(0);
  const current = TABS[active];

  return (
    <section id="product" className="relative px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.p
            {...reveal}
            transition={{ duration: 0.7 }}
            className="font-sans text-xs font-medium uppercase tracking-widest text-neutral-500"
          >
            The product
          </motion.p>

          <motion.h2
            {...reveal}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-barabara mt-4 text-4xl leading-[1.1] tracking-tight text-neutral-950 dark:text-white sm:text-5xl"
          >
            Feedback a developer can act on in seconds
          </motion.h2>

          <motion.p
            {...reveal}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 font-sans text-base leading-relaxed text-neutral-600 dark:text-neutral-400 sm:text-lg"
          >
            No vague suggestions. Every comment is traceable to a rule you
            wrote.
          </motion.p>
        </div>

        {/* Showcase */}
        <motion.div
          {...reveal}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 grid gap-8 lg:grid-cols-5 lg:gap-12"
        >
          {/* Tab list */}
          <div className="flex flex-col gap-3 lg:col-span-2">
            {TABS.map((tab, i) => {
              const isActive = i === active;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActive(i)}
                  aria-pressed={isActive}
                  className={`rounded-2xl border p-5 text-left transition-colors ${
                    isActive
                      ? "border-neutral-950 bg-white dark:border-white dark:bg-neutral-950"
                      : "border-neutral-200 bg-white hover:border-neutral-300 dark:border-white/10 dark:bg-neutral-950 dark:hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex size-9 shrink-0 items-center justify-center rounded-full border ${
                        isActive
                          ? "border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-neutral-950"
                          : "border-neutral-200 bg-neutral-50 text-neutral-700 dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-300"
                      }`}
                    >
                      <tab.icon size={16} />
                    </span>
                    <h3 className="font-sans text-base font-semibold tracking-tight text-neutral-950 dark:text-white">
                      {tab.title}
                    </h3>
                  </div>
                  <p className="mt-3 font-sans text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    {tab.body}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Window */}
          <div className="lg:col-span-3">
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl shadow-neutral-900/10 dark:border-white/10 dark:bg-neutral-950 dark:shadow-black/60">
              <div className="flex items-center gap-2 border-b border-neutral-200 px-4 py-3 dark:border-white/10">
                <span className="size-3 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                <span className="size-3 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                <span className="size-3 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                <span className="ml-3 font-sans text-xs text-neutral-500">
                  {current.window}
                </span>
              </div>

              <div className="min-h-104 p-5 sm:p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    {current.view}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Product;
