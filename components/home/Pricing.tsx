"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "../ui/button";

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

/* ---------- Plans (placeholders: edit freely) ---------- */

const PLANS = [
  {
    name: "Free",
    price: "$0",
    unit: "",
    description: "For small teams and open-source projects getting started.",
    cta: "Install on GitHub",
    href: "/install",
    highlighted: false,
    features: [
      "Up to 3 repositories",
      "Custom principles in Markdown",
      "Rule-cited findings on every PR",
      "Commit-vs-diff check",
      "Review history (30 days)",
    ],
  },
  {
    name: "Team",
    price: "$19",
    unit: "/ developer / month",
    description:
      "For engineering teams that want standards enforced everywhere.",
    cta: "Start with Team",
    href: "/install",
    highlighted: true,
    features: [
      "Unlimited repositories",
      "Everything in Free",
      "Full review history",
      "Violation analytics per rule",
      "Multiple principle sets per repo",
      "Email support",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    unit: "",
    description: "For organizations with security and compliance requirements.",
    cta: "Contact us",
    href: "/contact",
    highlighted: false,
    features: [
      "Everything in Team",
      "Security review and custom terms",
      "Priority support",
      "Early access to SSO, audit logs and self-hosting",
    ],
  },
];

/* ---------- Section ---------- */

const Pricing = () => {
  return (
    <section id="pricing" className="relative px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.p
            {...reveal}
            transition={{ duration: 0.7 }}
            className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-brand"
          >
            05 &middot; Pricing
          </motion.p>

          <motion.h2
            {...reveal}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-barabara mt-4 text-4xl leading-[1.1] tracking-tight text-neutral-950 dark:text-white sm:text-5xl"
          >
            Simple pricing that scales with your team
          </motion.h2>

          <motion.p
            {...reveal}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 font-sans text-base leading-relaxed text-neutral-600 dark:text-neutral-400 sm:text-lg"
          >
            Start free on a few repositories. Upgrade when your whole team
            depends on it.
          </motion.p>
        </div>

        {/* Plans — Team is the inverted black card */}
        <div className="mt-16 grid items-stretch gap-4 lg:grid-cols-3">
          {PLANS.map((plan, i) => {
            const inverted = plan.highlighted;
            return (
              <motion.div
                key={plan.name}
                {...reveal}
                transition={{ duration: 0.8, delay: 0.1 + i * 0.1 }}
                className={`relative flex flex-col rounded-2xl border p-6 sm:p-8 ${
                  inverted
                    ? "border-brand/40 bg-linear-to-br from-brand-soft to-brand/10 text-neutral-950 shadow-[0_30px_80px_-44px_var(--brand-glow)] dark:border-brand/25 dark:text-white"
                    : "border-neutral-200 bg-white dark:border-white/10 dark:bg-neutral-950"
                }`}
              >
                {inverted && (
                  <span className="absolute -top-3 left-6 rounded-full bg-brand px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-brand-foreground shadow-[0_8px_24px_-8px_var(--brand-glow)] sm:left-8">
                    Most popular
                  </span>
                )}

                <h3 className="font-sans text-lg font-semibold tracking-tight text-neutral-950 dark:text-white">
                  {plan.name}
                </h3>
                <p className="mt-2 min-h-10 font-sans text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {plan.description}
                </p>

                <div className="mt-6 flex items-baseline gap-2">
                  <span className="font-barabara text-5xl tracking-tight text-neutral-950 dark:text-white">
                    {plan.price}
                  </span>
                  {plan.unit && (
                    <span className="font-sans text-sm text-neutral-600 dark:text-neutral-400">
                      {plan.unit}
                    </span>
                  )}
                </div>

                <Button
                  nativeButton={false}
                  render={<Link href={plan.href} />}
                  className={`mt-6 h-auto rounded-full px-6 py-3 font-sans text-sm font-medium transition-colors ${
                    inverted
                      ? "brand-glow bg-brand text-brand-foreground hover:bg-brand/90"
                      : "border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50 dark:border-white/15 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:bg-neutral-900"
                  }`}
                >
                  {plan.cta}
                </Button>

                <ul className="mt-8 space-y-3 border-t border-neutral-200 pt-6 dark:border-white/10">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 font-sans text-sm text-neutral-700 dark:text-neutral-300"
                    >
                      <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
                        <Check size={11} strokeWidth={3} />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* Footnote */}
        <motion.p
          {...reveal}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-8 text-center font-sans text-sm text-neutral-500"
        >
          Early-access teams get Team free while we shape the product with
          them.{" "}
          <Link
            href="/contact"
            className="font-medium text-brand underline underline-offset-4 hover:text-brand/80"
          >
            Talk to us
          </Link>
        </motion.p>
      </div>
    </section>
  );
};

export default Pricing;
