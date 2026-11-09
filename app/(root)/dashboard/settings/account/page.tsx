import { Suspense } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import ConnectGitHubButton from "@/components/dashboard/ConnectGitHubButton";
import { GithubIcon } from "@/components/GithubIcon";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export const metadata = {
  title: "Account — Plumbcode",
};

const card =
  "rounded-2xl border border-neutral-200 bg-white p-5 dark:border-white/10 dark:bg-neutral-950 sm:p-6";
const eyebrow =
  "font-sans text-xs font-medium uppercase tracking-widest text-neutral-500";

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div role="status">
          <div className="h-64 animate-pulse rounded-2xl bg-neutral-200/60 dark:bg-white/5" />
          <span className="sr-only">Loading account settings…</span>
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  );
}

async function AccountContent() {
  const session = await requireSession();

  const [accounts, installationCount] = await Promise.all([
    prisma.account.findMany({
      where: { userId: session.user.id },
      select: { providerId: true, createdAt: true },
    }),
    prisma.installation.count({ where: { userId: session.user.id } }),
  ]);

  const github = accounts.find((account) => account.providerId === "github");
  const credential = accounts.find(
    (account) => account.providerId === "credential",
  );

  const connected = (date: Date) =>
    `Connected ${date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;

  return (
    <div className="space-y-4">
      <section className={card}>
        <h2 className={eyebrow}>Profile</h2>
        <dl className="mt-4 space-y-4">
          <div>
            <dt className="font-sans text-xs text-neutral-500">Name</dt>
            <dd className="mt-0.5 font-sans text-sm font-medium text-neutral-950 dark:text-white">
              {session.user.name}
            </dd>
          </div>
          <div>
            <dt className="font-sans text-xs text-neutral-500">Email</dt>
            <dd className="mt-0.5 flex flex-wrap items-center gap-2 font-sans text-sm font-medium text-neutral-950 dark:text-white">
              {session.user.email}
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  session.user.emailVerified
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                }`}
              >
                {session.user.emailVerified ? "Verified" : "Not verified"}
              </span>
            </dd>
          </div>
        </dl>
      </section>

      <section className={card}>
        <h2 className={eyebrow}>Sign-in methods</h2>
        <ul className="mt-4 divide-y divide-neutral-200 dark:divide-white/10">
          <li className="flex items-center gap-3 py-3 first:pt-0">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-700 dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-300">
              <GithubIcon size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-sans text-sm font-medium text-neutral-950 dark:text-white">
                GitHub
              </p>
              <p className="font-sans text-xs text-neutral-500">
                {github ? connected(github.createdAt) : "Not connected"}
              </p>
            </div>
            {github ? (
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 font-sans text-xs font-medium text-emerald-700 dark:text-emerald-400">
                Connected
              </span>
            ) : (
              <ConnectGitHubButton callbackURL="/dashboard/settings/account" />
            )}
          </li>

          <li className="flex items-center gap-3 py-3 last:pb-0">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-700 dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-300">
              <Mail size={16} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-sans text-sm font-medium text-neutral-950 dark:text-white">
                Email and password
              </p>
              <p className="font-sans text-xs text-neutral-500">
                {credential ? connected(credential.createdAt) : "Not set up"}
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 font-sans text-xs font-medium ${
                credential
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "bg-neutral-200 text-neutral-600 dark:bg-white/10 dark:text-neutral-400"
              }`}
            >
              {credential ? "Connected" : "Not set up"}
            </span>
          </li>
        </ul>
      </section>

      <section className={card}>
        <h2 className={eyebrow}>GitHub installations</h2>
        <p className="mt-3 font-sans text-sm text-neutral-600 dark:text-neutral-400">
          {installationCount > 0
            ? `Plumbcode is installed on ${installationCount} GitHub account${
                installationCount === 1 ? "" : "s"
              }.`
            : "Plumbcode isn't installed on any GitHub account yet."}{" "}
          <Link
            href="/dashboard/repositories"
            className="font-medium text-neutral-950 underline underline-offset-4 dark:text-white"
          >
            Manage repositories
          </Link>
        </p>
      </section>
    </div>
  );
}
