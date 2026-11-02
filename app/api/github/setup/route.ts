import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Octokit, RequestError } from "octokit";
import { auth } from "@/lib/auth";
import { GITHUB_APP_SLUG, type InstallationErrorCode } from "@/lib/github-app";
import { prisma } from "@/lib/prisma";

// GitHub installation IDs are int64 in the API. Prisma stores them as a
// 32-bit integer, so reject anything that cannot fit before touching the DB.
const MAX_INSTALLATION_ID = 2_147_483_647;

function dashboardRedirect(req: Request, error?: InstallationErrorCode) {
  const url = new URL("/dashboard", req.url);
  if (error) url.searchParams.set("error", error);
  return NextResponse.redirect(url);
}

async function findUserInstallation(
  accessToken: string,
  installationId: number,
) {
  const octokit = new Octokit({ auth: accessToken });

  // This endpoint is paginated (30 by default, 100 max). paginate() follows
  // the Link headers so an installation on a later page is still found.
  const installations = await octokit.paginate("GET /user/installations", {
    per_page: 100,
  });

  return installations.find(
    (installation) => installation.id === installationId,
  );
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const rawInstallationId = url.searchParams.get("installation_id");
  const dashboard = new URL("/dashboard", req.url);

  if (!rawInstallationId) return NextResponse.redirect(dashboard);

  // Installation IDs are positive integers. Reject signs, decimals, and
  // exponent notation before converting.
  if (!/^\d+$/.test(rawInstallationId)) {
    return dashboardRedirect(req, "installation_not_found");
  }

  const installationId = Number(rawInstallationId);
  if (
    !Number.isSafeInteger(installationId) ||
    installationId <= 0 ||
    installationId > MAX_INSTALLATION_ID
  ) {
    return dashboardRedirect(req, "installation_not_found");
  }

  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!session) return NextResponse.redirect(new URL("/login", req.url));

  if (!GITHUB_APP_SLUG) {
    console.error(
      "GitHub install callback: NEXT_PUBLIC_GITHUB_APP_SLUG is not set",
    );
    return dashboardRedirect(req, "github_app_not_configured");
  }

  // Find the GitHub account linked to the signed-in Plumbcode user.
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
      "GitHub install callback: account lookup failed",
      error instanceof Error ? error.message : "unknown error",
    );
    return dashboardRedirect(req, "github_verification_failed");
  }

  if (!githubAccount) {
    return dashboardRedirect(req, "github_not_linked");
  }

  // Better Auth refreshes the token when possible. We pass the local account
  // row ID (not GitHub's accountId) to get the decrypted access token.
  let accessToken: string;
  try {
    const token = await auth.api.getAccessToken({
      body: { accountId: githubAccount.id },
      headers: requestHeaders,
    });

    if (!token.accessToken) {
      return dashboardRedirect(req, "github_token_invalid");
    }

    accessToken = token.accessToken;
  } catch (error) {
    console.error(
      "GitHub install callback: token lookup failed",
      error instanceof Error ? error.message : "unknown error",
    );
    return dashboardRedirect(req, "github_token_invalid");
  }

  // Never trust installation_id on its own. Ask GitHub, using the user's own
  // token, which installations this user can actually access.
  let match: Awaited<ReturnType<typeof findUserInstallation>>;
  try {
    match = await findUserInstallation(accessToken, installationId);
  } catch (error) {
    if (error instanceof RequestError && error.status === 401) {
      console.error(
        "GitHub install callback: GitHub rejected the user access token",
      );
      return dashboardRedirect(req, "github_token_invalid");
    }
    console.error(
      "GitHub install callback: GitHub request failed",
      error instanceof Error ? error.message : "unknown error",
    );
    return dashboardRedirect(req, "github_verification_failed");
  }

  if (!match || match.app_slug !== GITHUB_APP_SLUG) {
    if (match) {
      console.warn(
        `GitHub install callback: installation ${installationId} belongs to app "${match.app_slug}", expected "${GITHUB_APP_SLUG}"`,
      );
    }
    return dashboardRedirect(req, "installation_not_found");
  }

  const account = match.account as
    | { login?: string; name?: string; type?: string }
    | null;
  const accountLogin = account?.login ?? account?.name ?? "unknown";
  const accountType = account?.type ?? "Enterprise";

  try {
    const existing = await prisma.installation.findUnique({
      where: { id: installationId },
    });

    // This version has a single owner per installation. A teammate with
    // access to an org install must not silently "claim" an existing row.
    if (existing && existing.userId !== session.user.id) {
      return dashboardRedirect(req, "installation_already_linked");
    }

    await prisma.installation.upsert({
      where: { id: installationId },
      create: {
        id: installationId,
        accountLogin,
        accountType,
        userId: session.user.id,
      },
      update: {
        accountLogin,
        accountType,
      },
    });
  } catch (error) {
    console.error(
      "GitHub install callback: database write failed",
      error instanceof Error ? error.message : "unknown error",
    );
    return dashboardRedirect(req, "installation_save_failed");
  }

  return NextResponse.redirect(dashboard);
}
