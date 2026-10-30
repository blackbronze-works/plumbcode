"use client";

import { forwardRef, useId, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { GithubIcon } from "@/components/GithubIcon";
import { Button } from "@/components/ui/button";

/* ---------- Schemas ---------- */

const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type LoginData = z.infer<typeof loginSchema>;
type SignupData = z.infer<typeof signupSchema>;

/* ---------- Field ---------- */

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  action?: React.ReactNode;
};

const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, error, action, type = "text", ...props },
  ref,
) {
  const id = useId();
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div>
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="font-sans text-xs font-medium text-neutral-700 dark:text-neutral-300"
        >
          {label}
        </label>
        {action}
      </div>

      <div className="relative mt-1.5">
        <input
          id={id}
          ref={ref}
          type={isPassword && show ? "text" : type}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full rounded-xl border bg-white px-4 py-2.5 font-sans text-sm text-neutral-950 outline-none transition-colors placeholder:text-neutral-400 focus:ring-2 dark:bg-neutral-900 dark:text-white ${
            isPassword ? "pr-11" : ""
          } ${
            error
              ? "border-red-500 focus:ring-red-500/20"
              : "border-neutral-300 focus:border-neutral-950 focus:ring-neutral-950/10 dark:border-white/10 dark:focus:border-white dark:focus:ring-white/10"
          }`}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-neutral-500 transition-colors hover:text-neutral-950 dark:hover:text-white"
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 text-xs text-red-500"
        >
          {error}
        </p>
      )}
    </div>
  );
});

/* ---------- Shared button styles ---------- */

const primaryBtn =
  "h-auto w-full gap-2 rounded-full bg-neutral-950 px-6 py-3 font-sans text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-60 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200";

/* ---------- Page ---------- */

export default function AuthPage() {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [serverError, setServerError] = useState<string | null>(null);
  const [githubLoading, setGithubLoading] = useState(false);

  const loginForm = useForm<LoginData>({ resolver: zodResolver(loginSchema) });
  const signupForm = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
  });

  const switchTab = (next: "login" | "signup") => {
    setTab(next);
    setServerError(null);
  };

  /* TODO: replace these three with your real auth calls. */
  const handleGithub = async () => {
    setServerError(null);
    setGithubLoading(true);
    try {
      // e.g. signIn("github", { callbackUrl: "/dashboard" })
      console.log("github sign-in");
    } catch {
      setServerError("Couldn't connect to GitHub. Please try again.");
      setGithubLoading(false);
    }
  };

  const handleLogin = async (data: LoginData) => {
    setServerError(null);
    try {
      console.log("login", data);
    } catch {
      setServerError("Incorrect email or password.");
    }
  };

  const handleSignup = async (data: SignupData) => {
    setServerError(null);
    try {
      console.log("signup", data);
    } catch {
      setServerError("Couldn't create your account. Please try again.");
    }
  };

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-24">
      {/* Back link */}
      <Link
        href="/"
        className="absolute left-4 top-6 inline-flex items-center gap-2 font-sans text-sm text-neutral-600 transition-colors hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white sm:left-8"
      >
        <ArrowLeft size={16} />
        Back to home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full max-w-md lg:max-w-4xl"
      >
        {/* Card: column on mobile, row on desktop */}
        <div className="flex flex-col rounded-2xl border border-neutral-200 bg-white/70 p-6 shadow-2xl shadow-neutral-900/10 dark:border-white/10 dark:bg-neutral-950/70 dark:shadow-black/60 sm:p-8 lg:flex-row lg:p-0">
          {/* ---------- Left: logo, heading, GitHub ---------- */}
          <div className="flex flex-col items-center text-center lg:w-1/2 lg:items-start lg:p-12 lg:text-left">
            <Image
              src="/img/plumbcode-black.png"
              alt="Plumbcode"
              width={140}
              height={32}
              priority
              className="h-8 w-auto dark:hidden"
            />
            <Image
              src="/img/plumbcode-white.png"
              alt="Plumbcode"
              width={140}
              height={32}
              priority
              className="hidden h-8 w-auto dark:block"
            />

            {/* On desktop this block sits at the bottom of the column */}
            <div className="mt-6 flex w-full flex-col items-center lg:mt-auto lg:items-start lg:pt-24">
              <h1 className="font-barabara text-2xl tracking-tight text-neutral-950 dark:text-white lg:text-4xl lg:leading-[1.1]">
                {tab === "login" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="mt-2 font-sans text-sm text-neutral-600 dark:text-neutral-400 lg:mt-4 lg:max-w-xs lg:text-base lg:leading-relaxed">
                {tab === "login"
                  ? "Sign in to manage your repositories and principles."
                  : "Set up Plumbcode for your team in a few minutes."}
              </p>

              {/* GitHub (primary) */}
              <Button
                type="button"
                onClick={handleGithub}
                disabled={githubLoading}
                className={`mt-6 lg:mt-8 ${primaryBtn}`}
              >
                {githubLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <GithubIcon size={16} />
                )}
                Continue with GitHub
              </Button>
            </div>
          </div>

          {/* ---------- Right: email forms ---------- */}
          <div className="lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:border-l lg:border-neutral-200 lg:p-12 dark:lg:border-white/10">
            {/* Divider (mobile only) */}
            <div className="my-6 flex items-center gap-4 lg:hidden">
              <span className="h-px flex-1 bg-neutral-200 dark:bg-white/10" />
              <span className="font-sans text-xs text-neutral-500">
                or use email
              </span>
              <span className="h-px flex-1 bg-neutral-200 dark:bg-white/10" />
            </div>

            {/* Label (desktop only) */}
            <p className="mb-4 hidden font-sans text-xs font-medium uppercase tracking-widest text-neutral-500 lg:block">
              Or use email
            </p>

            {/* Tabs */}
            <div
              role="tablist"
              aria-label="Authentication mode"
              className="flex rounded-full border border-neutral-200 p-1 dark:border-white/10"
            >
              {(["login", "signup"] as const).map((t) => (
                <button
                  key={t}
                  role="tab"
                  type="button"
                  aria-selected={tab === t}
                  onClick={() => switchTab(t)}
                  className={`flex-1 rounded-full px-4 py-2 font-sans text-sm transition-colors ${
                    tab === t
                      ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                      : "text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
                  }`}
                >
                  {t === "login" ? "Login" : "Sign up"}
                </button>
              ))}
            </div>

            {/* Server error */}
            {serverError && (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 font-sans text-sm text-red-700 dark:text-red-400"
              >
                {serverError}
              </div>
            )}

            {/* Forms */}
            <div className="mt-6">
              <AnimatePresence mode="wait">
                {tab === "login" ? (
                  <motion.form
                    key="login"
                    noValidate
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                    onSubmit={loginForm.handleSubmit(handleLogin)}
                  >
                    <Field
                      label="Email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@company.com"
                      error={loginForm.formState.errors.email?.message}
                      {...loginForm.register("email")}
                    />
                    <Field
                      label="Password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="Your password"
                      error={loginForm.formState.errors.password?.message}
                      action={
                        <Link
                          href="/forgot-password"
                          className="font-sans text-xs text-neutral-500 underline-offset-4 hover:text-neutral-950 hover:underline dark:hover:text-white"
                        >
                          Forgot password?
                        </Link>
                      }
                      {...loginForm.register("password")}
                    />
                    <Button
                      type="submit"
                      disabled={loginForm.formState.isSubmitting}
                      className={primaryBtn}
                    >
                      {loginForm.formState.isSubmitting && (
                        <Loader2 size={16} className="animate-spin" />
                      )}
                      Login
                    </Button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="signup"
                    noValidate
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4"
                    onSubmit={signupForm.handleSubmit(handleSignup)}
                  >
                    <Field
                      label="Name"
                      autoComplete="name"
                      placeholder="Your name"
                      error={signupForm.formState.errors.name?.message}
                      {...signupForm.register("name")}
                    />
                    <Field
                      label="Work email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@company.com"
                      error={signupForm.formState.errors.email?.message}
                      {...signupForm.register("email")}
                    />
                    <Field
                      label="Password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      error={signupForm.formState.errors.password?.message}
                      {...signupForm.register("password")}
                    />
                    <Field
                      label="Confirm password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Repeat your password"
                      error={
                        signupForm.formState.errors.confirmPassword?.message
                      }
                      {...signupForm.register("confirmPassword")}
                    />
                    <Button
                      type="submit"
                      disabled={signupForm.formState.isSubmitting}
                      className={primaryBtn}
                    >
                      {signupForm.formState.isSubmitting && (
                        <Loader2 size={16} className="animate-spin" />
                      )}
                      Create account
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Legal */}
        <p className="mt-6 text-center font-sans text-xs leading-relaxed text-neutral-500">
          By continuing you agree to our{" "}
          <Link
            href="/terms"
            className="underline underline-offset-4 hover:text-neutral-950 dark:hover:text-white"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-4 hover:text-neutral-950 dark:hover:text-white"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </motion.div>
    </section>
  );
}
