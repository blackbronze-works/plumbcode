/**
 * Shared GitHub App configuration used by the install flow and dashboard.
 * The slug is public, so it is safe to expose to the browser.
 */
export const GITHUB_APP_SLUG =
  process.env.NEXT_PUBLIC_GITHUB_APP_SLUG?.trim() || null;

export type InstallationErrorCode =
  | "github_not_linked"
  | "github_token_invalid"
  | "installation_not_found"
  | "installation_already_linked"
  | "installation_save_failed"
  | "github_verification_failed"
  | "github_app_not_configured";

export const INSTALLATION_ERROR_MESSAGES: Record<
  InstallationErrorCode,
  string
> = {
  github_not_linked:
    "Your Plumbcode account isn't connected to GitHub yet. Sign in with GitHub, then install the app.",
  github_token_invalid:
    "Your GitHub connection expired. Sign in with GitHub again, then retry the installation.",
  installation_not_found:
    "GitHub couldn't confirm that installation belongs to your account. Try installing again.",
  installation_already_linked:
    "This installation is already connected to a different Plumbcode account.",
  installation_save_failed:
    "We verified the installation but couldn't save it. Please try again.",
  github_verification_failed:
    "We couldn't verify the installation with GitHub. Please try again.",
  github_app_not_configured:
    "GitHub installs aren't configured yet. Add NEXT_PUBLIC_GITHUB_APP_SLUG to the environment and restart.",
};

export function isInstallationErrorCode(
  value: string | null | undefined,
): value is InstallationErrorCode {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(INSTALLATION_ERROR_MESSAGES, value)
  );
}

export function getGithubInstallUrl(): string | null {
  if (!GITHUB_APP_SLUG) return null;
  return `https://github.com/apps/${encodeURIComponent(GITHUB_APP_SLUG)}/installations/new`;
}
