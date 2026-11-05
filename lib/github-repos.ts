import { headers } from "next/headers";
import { Octokit } from "octokit";
import { auth } from "@/lib/auth";

export type RepoSummary = {
  id: number;
  name: string;
  fullName: string;
  isPrivate: boolean;
  installationId: number;
};

export type GithubAuthResult =
  | { ok: true; octokit: Octokit }
  | { ok: false; error: "github_not_linked" | "github_token_invalid" };

/**
 * Resolves an Octokit client for the signed-in user's GitHub App token. This
 * is the same account the install callback verified, so it only sees
 * installations the user can already access.
 */
export async function getGithubUserAuth(): Promise<GithubAuthResult> {
  const requestHeaders = await headers();

  let githubAccount: { id: string; providerId: string } | undefined;

  try {
    const accounts = await auth.api.listUserAccounts({
      headers: requestHeaders,
    });
    githubAccount = accounts.find(
      (account) => account.providerId === "github",
    );
  } catch (error) {
    console.error(
      "Repositories: account lookup failed",
      error instanceof Error ? error.message : "unknown error",
    );
    return { ok: false, error: "github_token_invalid" };
  }

  if (!githubAccount) {
    return { ok: false, error: "github_not_linked" };
  }

  try {
    // Better Auth refreshes the token when possible; pass the local account
    // row ID, not GitHub's accountId.
    const token = await auth.api.getAccessToken({
      body: { accountId: githubAccount.id },
      headers: requestHeaders,
    });

    if (!token.accessToken) {
      return { ok: false, error: "github_token_invalid" };
    }

    return { ok: true, octokit: new Octokit({ auth: token.accessToken }) };
  } catch (error) {
    console.error(
      "Repositories: token lookup failed",
      error instanceof Error ? error.message : "unknown error",
    );
    return { ok: false, error: "github_token_invalid" };
  }
}

// First 100 repositories per installation (paginated). Add a synced Repository
// table when installations start exceeding that.
export async function listInstallationRepos(
  octokit: Octokit,
  installationId: number,
): Promise<RepoSummary[]> {
  const repositories = await octokit.paginate(
    "GET /user/installations/{installation_id}/repositories",
    { installation_id: installationId, per_page: 100 },
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
