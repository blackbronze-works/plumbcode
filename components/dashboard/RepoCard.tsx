import { GitBranch } from "lucide-react";
import RepoPrinciplesDialog from "@/components/dashboard/RepoPrinciplesDialog";
import type { RepoActivity } from "@/lib/dashboard-data";
import type { Rule } from "@/lib/principles";
import { timeAgo } from "@/lib/time";

type Props = {
  installationId: number;
  fullName: string;
  isPrivate: boolean;
  rules: Rule[];
  hasSavedRules: boolean;
  needsAttention: boolean;
  activity?: RepoActivity;
};

const MAX_VISIBLE = 5;

function activityLabel(activity: RepoActivity | undefined): string {
  if (!activity || activity.reviews === 0) return "No reviews yet";

  const reviews = `${activity.reviews} review${
    activity.reviews === 1 ? "" : "s"
  }`;
  const findings = `${activity.findings} finding${
    activity.findings === 1 ? "" : "s"
  }`;
  const lastReview = activity.lastReviewAt
    ? ` · last reviewed ${timeAgo(activity.lastReviewAt)}`
    : "";

  return `${reviews} · ${findings}${lastReview}`;
}

export default function RepoCard({
  installationId,
  fullName,
  isPrivate,
  rules,
  hasSavedRules,
  needsAttention,
  activity,
}: Props) {
  const [owner, name] = fullName.split("/");

  const status = needsAttention
    ? { dot: "bg-amber-500", label: "Rules need attention" }
    : rules.length > 0
      ? {
          dot: "bg-emerald-500",
          label: `Checking ${rules.length} principle${
            rules.length === 1 ? "" : "s"
          }`,
        }
      : { dot: "bg-neutral-400", label: "Commit messages only" };

  return (
    <li className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 dark:border-white/10 dark:bg-neutral-950">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-700 dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-300">
          <GitBranch size={18} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-sans text-base font-semibold text-neutral-950 dark:text-white">
            <span className="font-normal text-neutral-500">{owner}/</span>
            {name}
          </h2>
          <p className="mt-0.5 flex items-center gap-2 font-sans text-xs text-neutral-600 dark:text-neutral-400">
            <span
              className={`size-1.5 shrink-0 rounded-full ${status.dot}`}
              aria-hidden="true"
            />
            {status.label}
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-neutral-200 px-2 py-0.5 font-sans text-xs text-neutral-600 dark:border-white/10 dark:text-neutral-400">
          {isPrivate ? "Private" : "Public"}
        </span>
      </div>

      <div className="mt-5 flex-1 border-t border-neutral-200 pt-4 dark:border-white/10">
        {rules.length > 0 ? (
          <>
            <ul className="space-y-2">
              {rules.slice(0, MAX_VISIBLE).map((rule) => (
                <li
                  key={rule.id}
                  className="flex gap-3 font-sans text-sm text-neutral-700 dark:text-neutral-300"
                >
                  <span
                    className={`mt-0.5 shrink-0 font-mono text-xs ${
                      needsAttention
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {rule.id}
                  </span>
                  <span className="min-w-0 break-words">{rule.text}</span>
                </li>
              ))}
            </ul>
            {rules.length > MAX_VISIBLE && (
              <p className="mt-3 font-sans text-xs text-neutral-500">
                +{rules.length - MAX_VISIBLE} more
              </p>
            )}
          </>
        ) : (
          <p className="font-sans text-sm text-neutral-600 dark:text-neutral-400">
            {hasSavedRules
              ? "Saved rules couldn't be read."
              : "No principles yet. Add a few rules and every pull request will be checked against them."}
          </p>
        )}

        {needsAttention && (
          <p className="mt-3 font-sans text-xs text-amber-700 dark:text-amber-400">
            Saved rules need attention. Open them to fix the format.
          </p>
        )}
      </div>

      <p className="mt-4 font-sans text-xs text-neutral-500">
        {activityLabel(activity)}
      </p>

      <RepoPrinciplesDialog
        installationId={installationId}
        repoFullName={fullName}
        initialRules={rules.map((rule) => rule.text)}
        hasSavedRules={hasSavedRules}
      />
    </li>
  );
}
