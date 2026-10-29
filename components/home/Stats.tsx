"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useInView } from "framer-motion";

const STATS = [
  { value: 40, suffix: "+", label: "Repositories connected" },
  { value: 200, suffix: "+", label: "Pull requests reviewed" },
  { value: 600, suffix: "+", label: "Rule checks run" },
  { value: 12, suffix: "", label: "Teams in early access" },
];

const CountUp = ({ value, suffix }: { value: number; suffix: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const el = ref.current;
    const controls = animate(0, value, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (v) => {
        el.textContent = `${Math.round(v).toLocaleString()}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, value, suffix]);

  return (
    <span ref={ref}>
      {value.toLocaleString()}
      {suffix}
    </span>
  );
};

const Stats = () => {
  return (
    <section className="px-4 pb-8 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8 }}
        className="mx-auto max-w-6xl"
      >
        <p className="text-center font-sans text-xs font-medium uppercase tracking-widest text-neutral-500">
          Trusted by engineering teams in early access
        </p>

        <div className="mt-8 grid grid-cols-2 overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-white/10 dark:bg-neutral-950 md:grid-cols-4">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className={`px-6 py-8 text-center sm:py-10 ${
                i % 2 === 1
                  ? "border-l border-neutral-200 dark:border-white/10"
                  : ""
              } ${
                i >= 2 ? "border-t border-neutral-200 dark:border-white/10" : ""
              } md:border-t-0 ${
                i > 0
                  ? "md:border-l md:border-neutral-200 md:dark:border-white/10"
                  : ""
              }`}
            >
              <div className="font-barabara text-4xl tracking-tight text-neutral-950 dark:text-white sm:text-5xl">
                <CountUp value={stat.value} suffix={stat.suffix} />
              </div>
              <p className="mt-2 font-sans text-sm text-neutral-600 dark:text-neutral-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default Stats;
