import Link from "next/link";
import { ArrowRight } from "lucide-react";
import LightRays from "../LightRays";

const GithubIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
  </svg>
);

const Hero = () => {
  return (
    <section className="relative flex min-h-screen flex-col items-center overflow-hidden px-4 pb-24 pt-36 sm:px-6">
      {/* Background */}
      <div className="absolute inset-0 z-[-1]">
        <div className="absolute bottom-0 left-0 h-[30%] w-full bg-linear-to-t from-white to-transparent dark:from-black" />
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
      </div>

      {/* Badge */}
      <Link
        href="#how-it-works"
        className="group mb-8 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/70 px-4 py-1.5 text-sm text-neutral-700 transition-colors hover:border-neutral-300 dark:border-white/10 dark:bg-neutral-950/70 dark:text-neutral-300 dark:hover:border-white/20"
      >
        <span className="size-1.5 rounded-full bg-emerald-500" />
        GitHub App for engineering teams
        <ArrowRight
          size={14}
          className="transition-transform group-hover:translate-x-0.5"
        />
      </Link>

      {/* Title: display font */}
      <h1 className="font-barabara max-w-4xl text-center text-5xl leading-[1.05] tracking-tight text-neutral-950 dark:text-white sm:text-6xl md:text-7xl">
        Every pull request, held to your standards
      </h1>

      {/* Subtitle: body font */}
      <p className="mt-6 max-w-2xl text-center font-sans text-base leading-relaxed text-neutral-600 dark:text-neutral-400 sm:text-lg">
        Plumbcode checks each PR against your team&rsquo;s written principles
        and flags where the code or commit message doesn&rsquo;t hold up, citing
        the exact rule and the exact lines.
      </p>

      {/* CTAs */}
      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/install"
          className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-6 py-3 font-sans text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
        >
          <GithubIcon size={16} />
          Install on GitHub
        </Link>
        <Link
          href="#how-it-works"
          className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-6 py-3 font-sans text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-50 dark:border-white/15 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:bg-neutral-900"
        >
          See how it works
        </Link>
      </div>

      {/* Trust line */}
      <p className="mt-6 font-sans text-xs text-neutral-500">
        Advisory by default &nbsp;·&nbsp; Minimal GitHub permissions
        &nbsp;·&nbsp; Set up in minutes
      </p>

      {/* Preview container */}
      <div className="mt-16 w-full max-w-6xl">
        <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 shadow-2xl shadow-neutral-900/10 dark:border-white/10 dark:bg-neutral-950 dark:shadow-black/60">
          <p className="font-sans text-sm text-neutral-500">
            Image or video here
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
