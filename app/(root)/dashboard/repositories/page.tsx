import { Suspense } from "react";
import AddRepositoryCard from "@/components/dashboard/AddRepositoryCard";
import ConnectGitHubButton from "@/components/dashboard/ConnectGitHubButton";
import RepoPrinciplesDialog from "@/components/dashboard/RepoPrinciplesDialog";
import RepositoriesSkeleton from "@/components/skeletons/RepositoriesSkeleton";
import { getGithubUserAuth, listInstallationRepos } from "@/lib/github-repos";
import { getAddRepositoriesUrl } from "@/lib/github-urls";
import { parsePrinciples } from "@/lib/principles";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export const metadata = {
  title: "Repositories — Plumbcode",
};

export default function RepositoriesPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="font-barabara text-3xl tracking-tight text-neutral-950 dark:text-white">
        Repositories
      </h1>
      <p className="mt-2 font-sans text-sm text-neutral-600 dark:text-neutral-400">
        Each repository has its own principles. Pull requests are checked
        against them.
      </p>

      {/* Session and GitHub data stream in behind a skeleton so navigations
          between dashboard pages stay instant. */}
      <Suspense fallback={<RepositoriesSkeleton />}>
        <RepositoriesContent />
      </Suspense>
    </div>
  );
}

async function RepositoriesContent() {
  const session = await requireSession();

  const installations = await prisma.installation.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, accountLogin: true, accountType: true },
  });

  const githubAuth = await getGithubUserAuth();

  if (!githubAuth.ok) {
    return (
      <>
        <p className="mt-2 max-w-md font-sans text-sm text-neutral-600 dark:text-neutral-400">
          {githubAuth.error === "github_not_linked"
            ? "Connect GitHub to load the repositories in your installations."
            : "Your GitHub connection expired. Reconnect to load your repositories."}
        </p>
        <div className="mt-4">
          <ConnectGitHubButton
            label={
              githubAuth.error === "github_not_linked"
                ? "Connect GitHub"
                : "Reconnect GitHub"
            }
          />
        </div>
      </>
    );
  }

  const installationIds = installations.map((installation) => installation.id);

  const [repoResults, principleSets] = await Promise.all([
    Promise.allSettled(
      installations.map((installation) =>
        listInstallationRepos(githubAuth.octokit, installation.id),
      ),
    ),
    prisma.principleSet.findMany({
      where: { installationId: { in: installationIds } },
      select: {
        installationId: true,
        repoFullName: true,
        markdown: true,
      },
    }),
  ]);

  const repos = repoResults
    .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  const failedInstallations = repoResults.filter(
    (result) => result.status === "rejected",
  ).length;

  const markdownByRepo = new Map(
    principleSets.map((set) => [
      `${set.installationId}:${set.repoFullName}`,
      set.markdown,
    ]),
  );

  const addUrl = getAddRepositoriesUrl(installations);

  return (
    <>
      {failedInstallations > 0 && (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 font-sans text-sm text-amber-800 dark:text-amber-300"
        >
          {failedInstallations === installations.length
            ? "Couldn't load repositories from GitHub. Reconnect GitHub or try again."
            : "Some repositories couldn't be loaded from GitHub. Refresh to try again."}
        </p>
      )}

      {addUrl === null && (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 font-sans text-sm text-amber-800 dark:text-amber-300"
        >
          Adding repositories isn&apos;t configured yet. Add
          NEXT_PUBLIC_GITHUB_APP_SLUG to the environment and restart.
        </p>
      )}

      {repos.length === 0 && (
        <p className="mt-8 font-sans text-sm text-neutral-600 dark:text-neutral-400">
          No repositories are connected yet.
        </p>
      )}

      <ul
        className={`${repos.length === 0 ? "mt-4" : "mt-8"} grid gap-4 sm:grid-cols-2`}
      >
        {repos.map((repo) => {
          const markdown = markdownByRepo.get(
            `${repo.installationId}:${repo.fullName}`,
          );
          const parsed = markdown ? parsePrinciples(markdown) : null;
          const rules = parsed?.rules ?? [];
          const needsAttention = parsed ? !parsed.ok : false;

          return (
            <li
              key={`${repo.installationId}:${repo.id}`}
              className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 dark:border-white/10 dark:bg-neutral-950"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="min-w-0 truncate font-sans text-base font-semibold text-neutral-950 dark:text-white">
                  {repo.fullName}
                </h2>
                <span className="shrink-0 rounded-full border border-neutral-200 px-2 py-0.5 font-sans text-xs text-neutral-600 dark:border-white/10 dark:text-neutral-400">
                  {repo.isPrivate ? "Private" : "Public"}
                </span>
              </div>

              <div className="mt-4 flex-1">
                {rules.length > 0 ? (
                  <>
                    <p className="font-sans text-xs font-medium uppercase tracking-widest text-neutral-500">
                      {rules.length} principle{rules.length === 1 ? "" : "s"}
                    </p>

                    <ul className="mt-2 space-y-1.5">
                      {rules.slice(0, 3).map((rule) => (
                        <li
                          key={rule.id}
                          className="flex gap-2 font-sans text-sm text-neutral-700 dark:text-neutral-300"
                        >
                          <span className="shrink-0 font-mono text-xs leading-5 text-emerald-600 dark:text-emerald-400">
                            {rule.id}
                          </span>
                          <span className="min-w-0 truncate">{rule.text}</span>
                        </li>
                      ))}
                    </ul>

                    {rules.length > 3 && (
                      <p className="mt-2 font-sans text-xs text-neutral-500">
                        +{rules.length - 3} more
                      </p>
                    )}
                  </>
                ) : (
                  <p className="font-sans text-sm text-neutral-600 dark:text-neutral-400">
                    No principles yet. Only commit messages are checked.
                  </p>
                )}

                {needsAttention && (
                  <p className="mt-3 font-sans text-xs text-amber-700 dark:text-amber-400">
                    Saved rules need attention — open them to fix the format.
                  </p>
                )}
              </div>

              <RepoPrinciplesDialog
                installationId={repo.installationId}
                repoFullName={repo.fullName}
                initialRules={rules.map((rule) => rule.text)}
                hasSavedRules={Boolean(markdown)}
              />
            </li>
          );
        })}

        <li className={repos.length === 0 ? "flex sm:col-span-2" : "flex"}>
          <AddRepositoryCard url={addUrl} />
        </li>
      </ul>
    </>
  );
}
