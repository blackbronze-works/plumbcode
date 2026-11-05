import { App } from "octokit";

// GitHub installation IDs are int64 in the API. Prisma stores them as a
// 32-bit integer, so reject anything that cannot fit before touching the DB.
export const MAX_INSTALLATION_ID = 2_147_483_647;

function normalizePrivateKey(value: string | undefined): string | null {
  if (!value) return null;

  return value
    .replace(/^"|"$/g, "")
    .replace(/\\n/g, "\n")
    .trim();
}

function createGithubApp() {
  const rawAppId = process.env.GITHUB_APP_ID?.trim();
  const appId = rawAppId?.match(/^\d+/)?.[0];
  const privateKey = normalizePrivateKey(process.env.GITHUB_APP_PRIVATE_KEY);
  const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET?.trim();

  if (!appId || !privateKey || !webhookSecret) {
    console.error(
      "GitHub App: GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY, or GITHUB_WEBHOOK_SECRET is missing",
    );
    return null;
  }

  return new App({
    appId,
    privateKey,
    webhooks: { secret: webhookSecret },
  });
}

export type GithubApp = NonNullable<ReturnType<typeof createGithubApp>>;

let cachedGithubApp: ReturnType<typeof createGithubApp> | undefined;

export function getGithubApp(): GithubApp | null {
  if (cachedGithubApp !== undefined) return cachedGithubApp;

  try {
    cachedGithubApp = createGithubApp();
  } catch (error) {
    console.error(
      "GitHub App: failed to initialize",
      error instanceof Error ? error.message : "unknown error",
    );
    cachedGithubApp = null;
  }

  return cachedGithubApp;
}
