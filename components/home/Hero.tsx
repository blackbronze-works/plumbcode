"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import LightRays from "../LightRays";
import { Button } from "../ui/button";
import { GithubIcon } from "../GithubIcon";

const Hero = () => {
  return (
    <section className="relative flex min-h-screen flex-col items-center overflow-hidden px-4 pb-24 pt-36 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 1.0 }}
        className="absolute inset-0 z-[-1]"
      >
        <LightRays
          className=""
          raysOrigin="top-center"
          raysColor="#ffffff"
          raysSpeed={1.5}
          lightSpread={0.5}
          rayLength={3}
          glow={0.6}
          haze={0.25}
          followMouse={false}
          mouseInfluence={0.1}
          rayDensity={1}
          tilt={0}
          raySharpness={0.35}
          atmosphere={1}
          intensity={1}
          fadeDistance={0.8}
          saturation={1}
          noiseAmount={0}
          distortion={0}
          pulsating={false}
          cursorShadow
          clickPulse
          intro
          lightMode={false}
        />
        <div className="absolute bottom-0 left-0 h-[30%] w-full bg-linear-to-t from-white to-transparent dark:from-black" />
      </motion.div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        <Link
          href="#how-it-works"
          className="group mb-8 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/70 px-4 py-1.5 text-sm text-neutral-700 transition-colors hover:border-neutral-300 dark:border-white/10 dark:bg-neutral-950/70 dark:text-neutral-300 dark:hover:border-white/20"
        >
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Plumbcode - GitHub App for engineering teams
          <ArrowRight
            size={14}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </motion.div>

      {/* Title: display font */}
      <motion.h1
        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 1.0, duration: 0.8 }}
        className="font-barabara max-w-4xl text-center text-5xl leading-[1.05] tracking-tight text-neutral-950 dark:text-white sm:text-6xl md:text-7xl"
      >
        Every pull request, held to your standards
      </motion.h1>

      {/* Subtitle: body font */}
      <motion.p
        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="mt-6 max-w-2xl text-center font-sans text-base leading-relaxed text-neutral-600 dark:text-neutral-400 sm:text-lg"
      >
        Plumbcode checks each PR against your team&rsquo;s written principles
        and flags where the code or commit message doesn&rsquo;t hold up, citing
        the exact rule and the exact lines.
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
      >
        <Button
          nativeButton={false}
          render={<Link href="/install" />}
          className="inline-flex items-center gap-2 rounded-full bg-neutral-950 h-auto px-6 py-3 font-sans text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
        >
          <GithubIcon size={16} />
          Install on GitHub
        </Button>
        <Button
          nativeButton={false}
          render={<Link href="#how-it-works" />}
          className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white h-auto px-6 py-3 font-sans text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-50 dark:border-white/15 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:bg-neutral-900"
        >
          See how it works
        </Button>
      </motion.div>

      {/* Trust line */}
      <motion.p
        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 1.6, duration: 0.8 }}
        className="mt-6 font-sans text-xs text-neutral-500"
      >
        Advisory by default &nbsp;·&nbsp; Minimal GitHub permissions
        &nbsp;·&nbsp; Set up in minutes
      </motion.p>

      {/* Preview container */}
      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 1.8, duration: 0.8 }}
        className="mt-16 w-full max-w-6xl"
      >
        <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 shadow-2xl shadow-neutral-900/10 dark:border-white/10 dark:bg-neutral-950 dark:shadow-black/60">
          <p className="font-sans text-sm text-neutral-500">
            Image or video here
          </p>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
