import { getGithubApp } from "@/lib/github-app-auth";

export type RepoSummary = {
  id: number;
  name: string;
  fullName: string;
  isPrivate: boolean;
  installationId: number;
};

/**
 * Lists repositories through the GitHub App's installation token. This does not
 * depend on the user's OAuth access token, which GitHub expires after a few
 * hours. Callers must only pass installations owned by the signed-in user.
 */
export async function listInstallationRepos(
  installationId: number,
): Promise<RepoSummary[]> {
  const app = getGithubApp();

  if (!app) {
    throw new Error("GitHub App is not configured");
  }

  const octokit = await app.getInstallationOctokit(installationId);

  // GitHub returns at most 100 repositories per page; paginate() follows the
  // Link headers so installations with more repositories are fully listed.
  const repositories = await octokit.paginate(
    "GET /installation/repositories",
    { per_page: 100 },
  );

  return repositories
    .map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      isPrivate: repo.private,
      installationId,
    }))
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
}
