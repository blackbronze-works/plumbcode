import { AlertCircle, ArrowUpRight, Plus } from "lucide-react";
import { GithubIcon } from "@/components/GithubIcon";
import ConnectGitHubButton from "@/components/dashboard/ConnectGitHubButton";
import {
  INSTALLATION_ERROR_MESSAGES,
  type InstallationErrorCode,
  getGithubInstallUrl,
} from "@/lib/github-app";

export type InstallationSummary = {
  id: number;
  accountLogin: string;
  accountType: string;
};

type Props = {
  installations: InstallationSummary[];
  hasGitHubAccount: boolean;
  errorCode: InstallationErrorCode | null;
};

const card =
  "rounded-2xl border border-neutral-200 bg-white dark:border-white/10 dark:bg-neutral-950";

const primaryAction =
  "inline-flex w-full items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 py-3 font-sans text-sm font-medium text-white transition-colors hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/30 focus-visible:ring-offset-2 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 dark:focus-visible:ring-white/40 dark:focus-visible:ring-offset-neutral-950 sm:w-auto";

const secondaryAction =
  "inline-flex items-center gap-1.5 self-start rounded-sm font-sans text-sm font-medium text-neutral-700 underline-offset-4 transition-colors hover:text-neutral-950 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/30 dark:text-neutral-300 dark:hover:text-white dark:focus-visible:ring-white/40";

function ErrorAlert({
  code,
  installUrl,
  installationsCount,
}: {
  code: InstallationErrorCode;
  installUrl: string | null;
  installationsCount: number;
}) {
  // The empty state already shows a Connect button when nothing is installed,
  // so only add one here when it wouldn't be duplicated.
  const showReconnect = code === "github_token_invalid";
  const showConnect = code === "github_not_linked" && installationsCount > 0;

  const showRetry =
    installUrl &&
    (code === "installation_not_found" ||
      code === "installation_save_failed" ||
      code === "github_verification_failed");

  return (
    <div
      role="alert"
      className="mt-6 flex gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4"
    >
      <AlertCircle
        size={18}
        className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
        aria-hidden="true"
      />
      <div className="min-w-0">
        <p className="font-sans text-sm font-medium text-red-800 dark:text-red-300">
          Couldn&apos;t connect GitHub
        </p>
        <p className="mt-1 font-sans text-sm leading-relaxed text-red-700 dark:text-red-400">
          {INSTALLATION_ERROR_MESSAGES[code]}
        </p>

        {(showReconnect || showConnect) && (
          <div className="mt-3">
            <ConnectGitHubButton
              label={showReconnect ? "Reconnect GitHub" : "Connect GitHub"}
            />
          </div>
        )}

        {showRetry && (
          <a
            href={installUrl}
            className="mt-3 inline-flex items-center gap-1 rounded-sm font-sans text-sm font-medium text-red-800 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30 dark:text-red-300"
          >
            Try installing again
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        )}
      </div>
    </div>
  );
}

function EmptyState({
  hasGitHubAccount,
  installUrl,
}: {
  hasGitHubAccount: boolean;
  installUrl: string | null;
}) {
  return (
    <div className={`mt-6 p-6 sm:p-8 ${card}`}>
      <div className="flex size-11 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-950 dark:border-white/10 dark:bg-neutral-900 dark:text-white">
        <GithubIcon size={20} />
      </div>

      <h3 className="mt-4 font-barabara text-xl tracking-tight text-neutral-950 dark:text-white">
        {hasGitHubAccount ? "Install the GitHub App" : "Connect GitHub first"}
      </h3>
      <p className="mt-2 max-w-md font-sans text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        {hasGitHubAccount
          ? "Install Plumbcode on the repositories you want checked. GitHub shows the exact permissions and repositories before anything is installed."
          : "Plumbcode needs your GitHub account to verify the installation. Connecting only links your account. You choose the repositories in the next step."}
      </p>

      <div className="mt-6">
        {!hasGitHubAccount ? (
          <ConnectGitHubButton />
        ) : installUrl ? (
          <a href={installUrl} className={primaryAction}>
            <GithubIcon size={16} />
            Install on GitHub
          </a>
        ) : (
          <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 font-sans text-sm text-amber-800 dark:text-amber-300">
            GitHub installs aren&apos;t configured yet. Set{" "}
            <code className="font-mono text-xs">
              NEXT_PUBLIC_GITHUB_APP_SLUG
            </code>{" "}
            and restart the app.
          </p>
        )}
      </div>
    </div>
  );
}

export default function InstallationsSection({
  installations,
  hasGitHubAccount,
  errorCode,
}: Props) {
  const installUrl = getGithubInstallUrl();

  return (
    <section aria-labelledby="installations-heading" className="mt-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="installations-heading"
            className="font-barabara text-xl tracking-tight text-neutral-950 dark:text-white"
          >
            GitHub installations
          </h2>
          <p className="mt-1 font-sans text-sm text-neutral-600 dark:text-neutral-400">
            {installations.length > 0
              ? "These accounts have the Plumbcode GitHub App installed."
              : "The GitHub account Plumbcode should work with."}
          </p>
        </div>

        {installations.length > 0 && hasGitHubAccount && installUrl && (
          <a href={installUrl} className={secondaryAction}>
            <Plus size={14} aria-hidden="true" />
            Add another installation
          </a>
        )}
      </div>

      {errorCode && (
        <ErrorAlert
          code={errorCode}
          installUrl={installUrl}
          installationsCount={installations.length}
        />
      )}

      {installations.length === 0 ? (
        <EmptyState
          hasGitHubAccount={hasGitHubAccount}
          installUrl={installUrl}
        />
      ) : (
        <ul className="mt-6 space-y-2">
          {installations.map((installation) => (
            <li
              key={installation.id}
              className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-center ${card}`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-950 dark:border-white/10 dark:bg-neutral-900 dark:text-white">
                  <GithubIcon size={18} />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-sans text-sm font-medium text-neutral-950 dark:text-white">
                    {installation.accountLogin}
                  </p>
                  <p className="mt-0.5 font-sans text-xs text-neutral-500">
                    {installation.accountType}
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-emerald-500/10 px-2.5 py-1 font-sans text-xs font-medium text-emerald-700 dark:text-emerald-400 sm:ml-auto sm:self-auto">
                <span
                  className="size-1.5 rounded-full bg-emerald-500"
                  aria-hidden="true"
                />
                Connected
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
