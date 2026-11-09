import { Suspense } from "react";
import { GitBranch } from "lucide-react";
import AddRepositoryCard from "@/components/dashboard/AddRepositoryCard";
import ConnectGitHubButton from "@/components/dashboard/ConnectGitHubButton";
import RepoCard from "@/components/dashboard/RepoCard";
import RepositoriesSkeleton from "@/components/skeletons/RepositoriesSkeleton";
import { getRepoActivity } from "@/lib/dashboard-data";
import { listInstallationRepos } from "@/lib/github-repos";
import { getAddRepositoriesUrl } from "@/lib/github-urls";
import { parsePrinciples } from "@/lib/principles";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export const metadata = {
  title: "Repositories — Plumbcode",
};

export default function RepositoriesPage() {
  return (
    <div className="w-full">
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

  const [installations, githubAccount] = await Promise.all([
    prisma.installation.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, accountLogin: true, accountType: true },
    }),
    prisma.account.findFirst({
      where: {
        userId: session.user.id,
        providerId: "github",
      },
      select: { id: true },
    }),
  ]);

  if (!githubAccount) {
    return (
      <>
        <p className="mt-2 max-w-md font-sans text-sm text-neutral-600 dark:text-neutral-400">
          Connect GitHub to load the repositories in your installations.
        </p>
        <div className="mt-4">
          <ConnectGitHubButton label="Connect GitHub" />
        </div>
      </>
    );
  }

  const installationIds = installations.map((installation) => installation.id);

  const [repoResults, principleSets, reviewActivity] = await Promise.all([
    Promise.allSettled(
      installations.map((installation) =>
        listInstallationRepos(installation.id),
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
    getRepoActivity(installationIds),
  ]);

  repoResults.forEach((result, index) => {
    if (result.status === "rejected") {
      const installation = installations[index];
      const reason = result.reason as {
        status?: number;
        message?: string;
      };

      console.error(
        `Repositories: failed to list installation ${installation.id} (${installation.accountLogin})`,
        `status=${reason?.status ?? "unknown"}`,
        reason?.message ?? result.reason,
      );
    }
  });

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

  const cards = repos.map((repo) => {
    const key = `${repo.installationId}:${repo.fullName}`;
    const markdown = markdownByRepo.get(key);
    const parsed = markdown ? parsePrinciples(markdown) : null;

    return {
      repo,
      markdown,
      rules: parsed?.rules ?? [],
      needsAttention: parsed ? !parsed.ok : false,
      activity: reviewActivity.get(key),
    };
  });

  const totalRules = cards.reduce((sum, card) => sum + card.rules.length, 0);
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

      {cards.length === 0 ? (
        <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-neutral-200 bg-white p-10 text-center dark:border-white/10 dark:bg-neutral-950">
          <div className="flex size-10 items-center justify-center rounded-full border border-neutral-300 dark:border-white/20">
            <GitBranch
              size={18}
              className="text-neutral-600 dark:text-neutral-400"
            />
          </div>
          <p className="font-sans text-sm text-neutral-600 dark:text-neutral-400">
            No repositories are connected yet.
          </p>
          <AddRepositoryCard url={addUrl} />
        </div>
      ) : (
        <>
          <p className="mt-6 font-sans text-xs font-medium uppercase tracking-widest text-neutral-500">
            {cards.length} repositor{cards.length === 1 ? "y" : "ies"} ·{" "}
            {totalRules} principle{totalRules === 1 ? "" : "s"}
          </p>

          <ul className="mt-3 grid gap-4 sm:grid-cols-2">
            {cards.map(
              ({ repo, markdown, rules, needsAttention, activity }) => (
                <RepoCard
                  key={`${repo.installationId}:${repo.id}`}
                  installationId={repo.installationId}
                  fullName={repo.fullName}
                  isPrivate={repo.isPrivate}
                  rules={rules}
                  hasSavedRules={Boolean(markdown)}
                  needsAttention={needsAttention}
                  activity={activity}
                />
              ),
            )}

            <li className="flex">
              <AddRepositoryCard url={addUrl} />
            </li>
          </ul>
        </>
      )}
    </>
  );
}
