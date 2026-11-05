import { getGithubInstallUrl } from "@/lib/github-app";

type InstallationRef = {
  id: number;
  accountLogin: string;
  accountType: string;
};

/**
 * Deep-links to the repo-access panel for a single installation. With no
 * installation (or more than one), falls back to the app install page.
 */
export function getAddRepositoriesUrl(
  installations: InstallationRef[],
): string | null {
  if (installations.length === 1) {
    const [installation] = installations;

    return installation.accountType === "Organization"
      ? `https://github.com/organizations/${encodeURIComponent(installation.accountLogin)}/settings/installations/${installation.id}`
      : `https://github.com/settings/installations/${installation.id}`;
  }

  return getGithubInstallUrl();
}
