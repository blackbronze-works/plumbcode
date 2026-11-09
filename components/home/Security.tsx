"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  EyeOff,
  KeyRound,
  Lock,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
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

/* ---------- Data ---------- */

const FLOW = [
  {
    title: "GitHub sends a PR event",
    body: "A webhook tells Plumbcode a pull request was opened or updated.",
    badge: null,
  },
  {
    title: "Plumbcode reads the change",
    body: "It fetches the diff and commit messages, and loads your principles.",
    badge: null,
  },
  {
    title: "The model checks it",
    body: "Only that diff, those messages and your rules are sent to the model.",
    // Restore "No training on your code" once reviews run on a paid Gemini
    // tier or another provider that does not train on customer data.
    badge: null,
  },
  {
    title: "Findings go back to the PR",
    body: "Results are posted as a check run and comment. The diff is discarded.",
    badge: "Diff not stored",
  },
];

const PERMISSIONS = [
  { scope: "Metadata", access: "Read", why: "Identify the repository and PR." },
  {
    scope: "Contents",
    access: "Read",
    why: "Fetch the diff and commit messages.",
  },
  {
    scope: "Pull requests",
    access: "Read & write",
    why: "Read the PR and post one comment.",
  },
  {
    scope: "Checks",
    access: "Read & write",
    why: "Report results as a check run.",
  },
];

const COMMITMENTS = [
  {
    icon: KeyRound,
    title: "Least-privilege access",
    body: "Four scopes, listed above. No access to secrets, settings, or repositories you don't select.",
  },
  {
    icon: EyeOff,
    title: "Your code isn't kept",
    body: "Diffs are processed to produce findings and then discarded. We store results, not source.",
  },
  {
    icon: Lock,
    title: "Encrypted everywhere",
    body: "Data is encrypted in transit and at rest, and access tokens are short-lived.",
  },
  {
    icon: SlidersHorizontal,
    title: "You choose the scope",
    body: "Enable Plumbcode per repository, and remove it from any repo at any time.",
  },
  {
    icon: ShieldCheck,
    title: "Advisory, never blocking",
    body: "Plumbcode warns. It never auto-merges, never blocks a merge, and never pushes code.",
  },
  {
    icon: Trash2,
    title: "Delete on request",
    body: "Uninstalling stops all access, and you can ask us to delete your stored findings and rules.",
  },
];

const ROADMAP = [
  { label: "SOC 2 Type II", status: "Planned" },
  { label: "Self-hosted deployment", status: "Planned" },
  { label: "SSO and audit logs", status: "Planned" },
];

/* ---------- Section ---------- */

const Security = () => {
  return (
    <section id="security" className="relative px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.p
            {...reveal}
            transition={{ duration: 0.7 }}
            className="inline-flex items-center gap-2 rounded-full border border-brand-border bg-brand-soft/60 px-3 py-1 font-sans text-[11px] font-medium uppercase tracking-widest text-brand dark:bg-brand-soft/40"
          >
            <span className="size-1 rounded-full bg-brand" />
            Security &amp; privacy
          </motion.p>

          <motion.h2
            {...reveal}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-barabara mt-4 text-4xl leading-[1.1] tracking-tight text-neutral-950 dark:text-white sm:text-5xl"
          >
            Built to be trusted with your code
          </motion.h2>

          <motion.p
            {...reveal}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 font-sans text-base leading-relaxed text-neutral-600 dark:text-neutral-400 sm:text-lg"
          >
            Here is exactly what Plumbcode can access, what leaves GitHub, and
            what we keep.
          </motion.p>
        </div>

        {/* Data flow — the section's gradient card */}
        <motion.div
          {...reveal}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mt-16 rounded-2xl border border-brand/30 bg-linear-to-br from-brand-soft to-brand/10 p-6 shadow-[0_24px_70px_-40px_var(--brand-glow)] dark:border-brand/25 sm:p-8"
        >
          <p className="font-sans text-xs font-medium uppercase tracking-widest text-neutral-500">
            What happens to a pull request
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-4 md:gap-4">
            {FLOW.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="flex items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand font-mono text-xs text-brand-foreground">
                    {i === 0 ? <GithubIcon size={14} /> : i + 1}
                  </span>
                  {i < FLOW.length - 1 && (
                    <>
                      <span className="hidden h-px flex-1 bg-brand/30 md:block" />
                      <ArrowRight
                        size={14}
                        className="hidden shrink-0 text-brand/70 md:block"
                      />
                    </>
                  )}
                </div>

                <h3 className="mt-4 font-sans text-sm font-semibold text-neutral-950 dark:text-white">
                  {step.title}
                </h3>
                <p className="mt-1.5 font-sans text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {step.body}
                </p>
                {step.badge && (
                  <span className="mt-3 inline-block rounded-full border border-white/60 bg-white/70 px-2.5 py-1 font-sans text-xs font-medium text-neutral-800 dark:border-white/10 dark:bg-neutral-950/40 dark:text-white">
                    {step.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Permissions + commitments */}
        <div className="mt-4 grid gap-4 lg:grid-cols-5">
          {/* Permissions table — flat card */}
          <motion.div
            {...reveal}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-white/10 dark:bg-neutral-950 sm:p-8 lg:col-span-2"
          >
            <p className="font-sans text-xs font-medium uppercase tracking-widest text-neutral-500">
              GitHub permissions
            </p>
            <h3 className="font-barabara mt-3 text-2xl leading-tight tracking-tight text-neutral-950 dark:text-white">
              Four scopes. That&rsquo;s all.
            </h3>

            <div className="mt-6 divide-y divide-neutral-200 dark:divide-white/10">
              {PERMISSIONS.map((p) => (
                <div key={p.scope} className="py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-sans text-sm font-medium text-neutral-950 dark:text-white">
                      {p.scope}
                    </span>
                    <span className="rounded-full border border-neutral-200 px-2.5 py-0.5 font-mono text-xs text-neutral-600 dark:border-white/10 dark:text-neutral-400">
                      {p.access}
                    </span>
                  </div>
                  <p className="mt-1 font-sans text-xs text-neutral-500">
                    {p.why}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Commitments grid — flat cards with hover glow */}
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-3">
            {COMMITMENTS.map((item, i) => (
              <motion.div
                key={item.title}
                {...reveal}
                transition={{ duration: 0.8, delay: 0.1 + i * 0.08 }}
                className="card-glow rounded-2xl border border-neutral-200 bg-white p-6 dark:border-white/10 dark:bg-neutral-950"
              >
                <div className="inline-flex size-9 items-center justify-center rounded-full border border-brand-border bg-brand-soft text-brand dark:bg-brand-soft/60">
                  <item.icon size={16} />
                </div>
                <h3 className="mt-4 font-sans text-base font-semibold tracking-tight text-neutral-950 dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-2 font-sans text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {item.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Roadmap — flat card */}
        <motion.div
          {...reveal}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mt-4 flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-white/10 dark:bg-neutral-950 sm:flex-row sm:items-center sm:justify-between sm:p-8"
        >
          <div>
            <h3 className="font-sans text-base font-semibold tracking-tight text-neutral-950 dark:text-white">
              On the roadmap
            </h3>
            <p className="mt-1 font-sans text-sm text-neutral-600 dark:text-neutral-400">
              Enterprise controls we&rsquo;ll build alongside our first
              customers.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {ROADMAP.map((r) => (
              <span
                key={r.label}
                className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-1.5 font-sans text-xs text-neutral-700 dark:border-white/10 dark:text-neutral-300"
              >
                {r.label}
                <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-brand dark:bg-brand-soft/60">
                  {r.status}
                </span>
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Security;
