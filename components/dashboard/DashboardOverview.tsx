import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  GitPullRequest,
  ShieldAlert,
} from "lucide-react";
import type { DashboardData } from "@/lib/dashboard-data";
import { timeAgo } from "@/lib/time";

const card =
  "rounded-2xl border border-neutral-200 bg-white dark:border-white/10 dark:bg-neutral-950";
const eyebrow =
  "font-sans text-xs font-medium uppercase tracking-widest text-neutral-500";
const fmt = (n: number) => n.toLocaleString("en-US");

function Diff({
  additions,
  deletions,
}: {
  additions: number;
  deletions: number;
}) {
  return (
    <span className="font-mono text-xs tabular-nums">
      <span className="text-emerald-600 dark:text-emerald-400">
        +{fmt(additions)}
      </span>{" "}
      <span className="text-red-600 dark:text-red-400">−{fmt(deletions)}</span>
    </span>
  );
}

function DiffBar({
  additions,
  deletions,
}: {
  additions: number;
  deletions: number;
}) {
  const total = additions + deletions;
  const pct = total === 0 ? 0 : Math.round((additions / total) * 100);

  return (
    <div
      className="flex h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-white/10"
      aria-hidden="true"
    >
      {total > 0 && (
        <>
          <span className="bg-emerald-500" style={{ width: `${pct}%` }} />
          <span className="bg-red-500" style={{ width: `${100 - pct}%` }} />
        </>
      )}
    </div>
  );
}

function StatTile({
  label,
  value,
  hint,
  children,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  children?: ReactNode;
}) {
  return (
    <div className={`${card} p-5`}>
      <p className={eyebrow}>{label}</p>
      <p className="mt-3 font-barabara text-3xl tracking-tight text-neutral-950 dark:text-white">
        {value}
      </p>
      {hint && (
        <p className="mt-1 font-sans text-xs text-neutral-500">{hint}</p>
      )}
      {children}
    </div>
  );
}

function EmptyOverview({ hasAnyReview }: { hasAnyReview: boolean }) {
  const steps = [
    "Open a pull request on a repository with Plumbcode installed.",
    "Plumbcode checks commit messages automatically.",
    "Optionally add principles to a repository to check code against your rules, too.",
  ];

  return (
    <div className={`mt-8 p-8 text-center sm:p-12 ${card}`}>
      <div className="mx-auto flex size-12 items-center justify-center rounded-full border border-brand-border bg-brand-soft text-brand">
        <GitPullRequest size={20} aria-hidden="true" />
      </div>
      <h2 className="mt-5 font-barabara text-xl tracking-tight text-neutral-950 dark:text-white">
        {hasAnyReview ? "No reviews in the last 30 days" : "No reviews yet"}
      </h2>

      {hasAnyReview ? (
        <p className="mx-auto mt-5 max-w-sm font-sans text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          Nothing has been reviewed in the last 30 days. Open a pull request or
          check that Plumbcode is installed on the repository you&apos;re
          working in.
        </p>
      ) : (
        <ol className="mx-auto mt-5 max-w-sm space-y-3 text-left">
          {steps.map((step, index) => (
            <li
              key={step}
              className="flex gap-3 font-sans text-sm text-neutral-600 dark:text-neutral-400"
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-neutral-300 font-mono text-xs dark:border-white/20">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      )}

      <Link
        href="/dashboard/repositories"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-neutral-950 px-6 py-3 font-sans text-sm font-medium text-white transition-colors hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/30 focus-visible:ring-offset-2 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 dark:focus-visible:ring-white/40 dark:focus-visible:ring-offset-neutral-950"
      >
        Go to repositories
      </Link>
    </div>
  );
}

export default function DashboardOverview({ data }: { data: DashboardData }) {
  if (data.prsReviewed === 0) {
    return <EmptyOverview hasAnyReview={data.hasAnyReview} />;
  }

  const maxDaily = Math.max(1, ...data.daily.map((day) => day.count));
  const maxRule = Math.max(1, ...data.topRules.map((rule) => rule.count));

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 className="font-barabara text-xl tracking-tight text-neutral-950 dark:text-white">
          Activity
        </h2>
        <span className="font-sans text-xs text-neutral-500">
          Last {data.days} days
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="PRs reviewed" value={fmt(data.prsReviewed)} />
        <StatTile
          label="Findings"
          value={fmt(data.findings)}
          hint="On the latest review of each PR"
        />
        <StatTile
          label="Clean rate"
          value={data.cleanRate === null ? "–" : `${data.cleanRate}%`}
          hint="No findings on the latest review"
        />
        <StatTile
          label="Lines changed"
          value={fmt(data.additions + data.deletions)}
          hint="Additions + deletions"
        >
          <div className="mt-3 space-y-2">
            <Diff additions={data.additions} deletions={data.deletions} />
            <DiffBar additions={data.additions} deletions={data.deletions} />
          </div>
        </StatTile>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className={`${card} p-5 lg:col-span-2`}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className={eyebrow}>Reviews per day</p>
            <span className="font-sans text-xs text-neutral-500">
              Last {data.chartDays} days
            </span>
          </div>

          <div className="mt-6 overflow-x-auto">
            <div className="flex h-40 min-w-[24rem] gap-1.5 sm:gap-2">
              {data.daily.map((day) => {
                const label = `${day.key}: ${day.count} review${
                  day.count === 1 ? "" : "s"
                }`;

                return (
                  <div
                    key={day.key}
                    className="flex flex-1 flex-col items-center gap-2"
                    role="img"
                    aria-label={label}
                    title={`${day.count} review${
                      day.count === 1 ? "" : "s"
                    } on ${day.key}`}
                  >
                    <div
                      className="flex w-full flex-1 items-end"
                      aria-hidden="true"
                    >
                      <div
                        className={`w-full rounded-t-md ${
                          day.count > 0
                            ? "bg-brand"
                            : "bg-neutral-200 dark:bg-white/10"
                        }`}
                        style={{
                          height:
                            day.count > 0
                              ? `${Math.max(8, (day.count / maxDaily) * 100)}%`
                              : "4px",
                        }}
                      />
                    </div>
                    <span
                      className="font-sans text-[10px] text-neutral-500"
                      aria-hidden="true"
                    >
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="mt-3 font-sans text-xs text-neutral-500">
            Every completed review, including re-reviews.
          </p>
        </section>

        <section className={`${card} p-5`}>
          <p className={eyebrow}>Most triggered rules</p>
          <p className="mt-1 font-sans text-xs text-neutral-500">
            Latest review of each PR
          </p>
          {data.topRules.length === 0 ? (
            <p className="mt-6 font-sans text-sm text-neutral-600 dark:text-neutral-400">
              No principle violations yet.
            </p>
          ) : (
            <ul className="mt-5 space-y-4">
              {data.topRules.map((rule) => (
                <li key={`${rule.repoFullName}:${rule.ruleId}:${rule.ruleText}`}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 font-sans text-sm text-neutral-800 dark:text-neutral-200">
                      <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400">
                        {rule.ruleId}
                      </span>{" "}
                      <span className="line-clamp-2">
                        {rule.ruleText ?? "Rule"}
                      </span>
                    </p>
                    <span className="shrink-0 font-mono text-xs text-neutral-500">
                      {rule.count}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate font-sans text-xs text-neutral-500">
                    {rule.repoFullName}
                  </p>
                  <div
                    className="mt-2 h-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-white/10"
                    aria-hidden="true"
                  >
                    <div
                      className="h-full rounded-full bg-brand"
                      style={{ width: `${(rule.count / maxRule) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className={`${card} p-5`}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className={eyebrow}>By repository</p>
          <span className="font-sans text-xs text-neutral-500">
            Latest review per PR
          </span>
        </div>

        <ul className="mt-4 divide-y divide-neutral-200 dark:divide-white/10">
          {data.repos.map((repo) => (
            <li
              key={`${repo.installationId}:${repo.repoFullName}`}
              className="grid gap-3 py-3 first:pt-0 last:pb-0 sm:grid-cols-[1fr_auto_8rem] sm:items-center sm:gap-6"
            >
              <p className="truncate font-sans text-sm font-medium text-neutral-950 dark:text-white">
                {repo.repoFullName}
              </p>
              <p className="font-sans text-xs text-neutral-500">
                {repo.prs} PR{repo.prs === 1 ? "" : "s"} · {repo.findings}{" "}
                finding{repo.findings === 1 ? "" : "s"}
              </p>
              <div className="space-y-1.5">
                <Diff additions={repo.additions} deletions={repo.deletions} />
                <DiffBar additions={repo.additions} deletions={repo.deletions} />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className={`${card} p-5`}>
        <p className={eyebrow}>Recent reviews</p>
        <ul className="mt-4 divide-y divide-neutral-200 dark:divide-white/10">
          {data.recent.map((review) => {
            const clean = review.findingCount === 0;

            return (
              <li
                key={`${review.installationId}:${review.repoFullName}#${review.prNumber}`}
                className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-4"
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <GitPullRequest
                    size={16}
                    className="mt-0.5 shrink-0 text-neutral-500"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <a
                      href={`https://github.com/${review.repoFullName}/pull/${review.prNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex max-w-full items-center gap-1 font-sans text-sm font-medium text-neutral-950 hover:underline dark:text-white"
                    >
                      <span className="min-w-0 truncate">
                        {review.prTitle}
                      </span>
                      <ArrowUpRight
                        size={12}
                        className="shrink-0"
                        aria-hidden="true"
                      />
                    </a>
                    <p className="truncate font-sans text-xs text-neutral-500">
                      {review.repoFullName} #{review.prNumber} ·{" "}
                      {timeAgo(review.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pl-7 sm:pl-0">
                  <Diff
                    additions={review.additions}
                    deletions={review.deletions}
                  />
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 font-sans text-xs font-medium ${
                      clean
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                        : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                    }`}
                  >
                    {clean ? (
                      <CheckCircle2 size={12} aria-hidden="true" />
                    ) : (
                      <ShieldAlert size={12} aria-hidden="true" />
                    )}
                    {clean
                      ? "Clean"
                      : `${review.findingCount} finding${
                          review.findingCount === 1 ? "" : "s"
                        }`}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
