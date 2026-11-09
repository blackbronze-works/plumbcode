import type { GithubApp } from "@/lib/github-app-auth";
import { MAX_INSTALLATION_ID } from "@/lib/github-app-auth";
import { reviewPullRequest } from "@/lib/github-review";
import { prisma } from "@/lib/prisma";

type JsonObject = Record<string, unknown>;

const REVIEW_ACTIONS = new Set([
  "opened",
  "reopened",
  "synchronize",
  "ready_for_review",
  "review_requested",
  "review_request_removed",
  "labeled",
  "unlabeled",
]);

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function objectAt(value: unknown, key: string): JsonObject | null {
  if (!isObject(value)) return null;

  const child = value[key];
  return isObject(child) ? child : null;
}

function stringAt(value: unknown, key: string): string | null {
  if (!isObject(value)) return null;

  const child = value[key];
  if (typeof child !== "string") return null;

  const trimmed = child.trim();
  return trimmed ? trimmed : null;
}

function positiveIntAt(value: unknown, key: string, max: number): number | null {
  if (!isObject(value)) return null;

  const child = value[key];
  if (typeof child !== "number" || !Number.isSafeInteger(child)) return null;
  if (child <= 0 || child > max) return null;

  return child;
}

function nonNegativeIntAt(
  value: unknown,
  key: string,
  max: number,
): number | null {
  if (!isObject(value)) return null;

  const child = value[key];
  if (typeof child !== "number" || !Number.isSafeInteger(child)) return null;
  if (child < 0 || child > max) return null;

  return child;
}

function githubUserId(value: unknown): string | null {
  if (!isObject(value)) return null;

  const id = value.id;
  if (typeof id !== "number" || !Number.isSafeInteger(id) || id <= 0) {
    return null;
  }

  return String(id);
}

function readInstallationId(payload: JsonObject): number | null {
  return positiveIntAt(
    objectAt(payload, "installation"),
    "id",
    MAX_INSTALLATION_ID,
  );
}

function readInstallation(payload: JsonObject): {
  id: number;
  accountLogin: string;
  accountType: string;
} | null {
  const installation = objectAt(payload, "installation");
  if (!installation) return null;

  const id = positiveIntAt(installation, "id", MAX_INSTALLATION_ID);
  const account = objectAt(installation, "account");
  const accountLogin = stringAt(account, "login");
  const accountType = stringAt(account, "type");

  if (id === null || !accountLogin || !accountType) return null;

  return { id, accountLogin, accountType };
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    isObject(error) &&
    typeof error.code === "string" &&
    error.code === "P2002"
  );
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "unknown error";
}

/**
 * A GitHub installation is linked to the Plumbcode user whose GitHub account
 * triggered the install. This only fills in installations that aren't linked
 * yet; an existing owner is never replaced.
 */
async function linkInstallation({
  id,
  accountLogin,
  accountType,
  senderId,
  deliveryId,
}: {
  id: number;
  accountLogin: string;
  accountType: string;
  senderId: string | null;
  deliveryId: string;
}) {
  const existing = await prisma.installation.findUnique({
    where: { id },
    select: { id: true },
  });

  if (existing) {
    await prisma.installation.update({
      where: { id },
      data: { accountLogin, accountType },
    });
    console.info(
      `GitHub webhook ${deliveryId}: installation ${id} is already linked, refreshed account details`,
    );
    return;
  }

  if (!senderId) {
    console.warn(
      `GitHub webhook ${deliveryId}: installation ${id} has no sender id, skipping link`,
    );
    return;
  }

  const account = await prisma.account.findFirst({
    where: { providerId: "github", accountId: senderId },
    select: { userId: true },
    orderBy: { createdAt: "asc" },
  });

  if (!account) {
    // The user may not have signed in with GitHub yet. The setup callback
    // links the installation once they finish the dashboard install flow.
    console.info(
      `GitHub webhook ${deliveryId}: installation ${id} belongs to an unlinked GitHub account, waiting for setup`,
    );
    return;
  }

  try {
    await prisma.installation.create({
      data: {
        id,
        accountLogin,
        accountType,
        userId: account.userId,
      },
    });
    console.info(
      `GitHub webhook ${deliveryId}: linked installation ${id} to a Plumbcode account`,
    );
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      console.info(
        `GitHub webhook ${deliveryId}: installation ${id} was linked concurrently`,
      );
      return;
    }

    throw error;
  }
}

async function handleInstallationEvent({
  action,
  payload,
  deliveryId,
}: {
  action: string;
  payload: JsonObject;
  deliveryId: string;
}) {
  if (action === "deleted") {
    const id = readInstallationId(payload);
    if (id === null) {
      console.warn(
        `GitHub webhook ${deliveryId}: installation.deleted payload is invalid`,
      );
      return;
    }

    const result = await prisma.installation.deleteMany({ where: { id } });
    console.info(
      result.count > 0
        ? `GitHub webhook ${deliveryId}: removed installation ${id} and its principles`
        : `GitHub webhook ${deliveryId}: installation ${id} was not linked, nothing to remove`,
    );
    return;
  }

  if (action === "suspend" || action === "unsuspend") {
    // Installations have no suspension field yet. Reviews keep working while
    // GitHub says the installation is suspended, but no state is persisted.
    console.info(
      `GitHub webhook ${deliveryId}: installation ${action} received`,
    );
    return;
  }

  if (action === "new_permissions_accepted") {
    console.info(
      `GitHub webhook ${deliveryId}: installation permissions accepted`,
    );
    return;
  }

  if (action !== "created") {
    console.info(
      `GitHub webhook ${deliveryId}: ignoring installation action "${action}"`,
    );
    return;
  }

  const installation = readInstallation(payload);
  if (!installation) {
    console.warn(
      `GitHub webhook ${deliveryId}: installation.created payload is invalid`,
    );
    return;
  }

  await linkInstallation({
    ...installation,
    senderId: githubUserId(payload.sender),
    deliveryId,
  });
}

function countRepositories(value: unknown): number {
  return Array.isArray(value) ? value.length : 0;
}

async function handleInstallationRepositoriesEvent({
  action,
  payload,
  deliveryId,
}: {
  action: string;
  payload: JsonObject;
  deliveryId: string;
}) {
  const id = readInstallationId(payload);
  if (id === null) {
    console.warn(
      `GitHub webhook ${deliveryId}: installation_repositories payload is invalid`,
    );
    return;
  }

  // Repositories are read live from GitHub, so there is no repository table
  // to sync. Log the change for observability and keep any saved principles,
  // which become active again if the repository is re-added.
  console.info(
    `GitHub webhook ${deliveryId}: installation ${id} repositories ${action} (added ${countRepositories(
      payload.repositories_added,
    )}, removed ${countRepositories(payload.repositories_removed)})`,
  );
}

async function handlePullRequestEvent({
  app,
  action,
  payload,
  deliveryId,
}: {
  app: GithubApp;
  action: string;
  payload: JsonObject;
  deliveryId: string;
}) {
  if (!REVIEW_ACTIONS.has(action)) {
    console.info(
      `GitHub webhook ${deliveryId}: pull_request.${action} not a review action, skipping`,
    );
    return;
  }

  const installationId = readInstallationId(payload);
  const repository = objectAt(payload, "repository");
  const owner = stringAt(objectAt(repository, "owner"), "login");
  const repo = stringAt(repository, "name");
  const pullRequest = objectAt(payload, "pull_request");
  const pullNumber = positiveIntAt(pullRequest, "number", 2_147_483_647);
  const headSha = stringAt(objectAt(pullRequest, "head"), "sha");
  const state = stringAt(pullRequest, "state");

  // Detailed validation with logging for each failure reason
  if (installationId === null) {
    console.warn(
      `GitHub webhook ${deliveryId}: pull_request.${action} missing installation id, skipping`,
    );
    return;
  }
  if (!owner) {
    console.warn(
      `GitHub webhook ${deliveryId}: pull_request.${action} missing repository owner, skipping`,
    );
    return;
  }
  if (!repo) {
    console.warn(
      `GitHub webhook ${deliveryId}: pull_request.${action} missing repository name, skipping`,
    );
    return;
  }
  if (pullNumber === null) {
    console.warn(
      `GitHub webhook ${deliveryId}: pull_request.${action} missing pull number, skipping`,
    );
    return;
  }
  if (!headSha) {
    console.warn(
      `GitHub webhook ${deliveryId}: pull_request.${action} missing head SHA, skipping`,
    );
    return;
  }
  if (state !== null && state !== "open") {
    console.info(
      `GitHub webhook ${deliveryId}: pull_request.${action} state="${state}" not open, skipping`,
    );
    return;
  }

  // Skip draft PRs - review when marked ready_for_review
  if (pullRequest?.draft === true) {
    console.info(
      `GitHub webhook ${deliveryId}: pull_request.${action} PR #${pullNumber} is draft, skipping`,
    );
    return;
  }

  // Skip bot PRs (Dependabot, Renovate, etc.)
  const userType = stringAt(objectAt(pullRequest, "user"), "type");
  if (userType === "Bot") {
    console.info(
      `GitHub webhook ${deliveryId}: pull_request.${action} PR #${pullNumber} from bot, skipping`,
    );
    return;
  }

  const prTitle = stringAt(pullRequest, "title");
  const additions =
    nonNegativeIntAt(pullRequest, "additions", 2_147_483_647) ?? 0;
  const deletions =
    nonNegativeIntAt(pullRequest, "deletions", 2_147_483_647) ?? 0;
  const changedFileCount = nonNegativeIntAt(
    pullRequest,
    "changed_files",
    2_147_483_647,
  );

  const installation = await prisma.installation.findUnique({
    where: { id: installationId },
    select: { id: true },
  });

  if (!installation) {
    // Attempt to auto-link the installation using the sender from the webhook
    const senderId = githubUserId(payload.sender);
    if (senderId) {
      console.info(
        `GitHub webhook ${deliveryId}: installation ${installationId} not linked, attempting auto-link via sender ${senderId}`,
      );
      // Re-read installation details for linking
      const installationDetails = readInstallation(payload);
      if (installationDetails) {
        await linkInstallation({
          ...installationDetails,
          senderId,
          deliveryId,
        });
      }
    } else {
      console.info(
        `GitHub webhook ${deliveryId}: installation ${installationId} is not linked to Plumbcode and no sender ID available, skipping review`,
      );
    }
    return;
  }

  await reviewPullRequest({
    app,
    installationId,
    owner,
    repo,
    pullNumber,
    headSha,
    deliveryId,
    prTitle,
    additions,
    deletions,
    changedFileCount,
  });
}

export type GithubWebhookInput = {
  app: GithubApp;
  event: string;
  payload: unknown;
  deliveryId: string;
};

/**
 * Routes a verified GitHub webhook. Installation events are handled inline so
 * a database failure makes GitHub retry; pull-request reviews run after the
 * response (see the route) because they call the model and GitHub for a while.
 */
export async function handleGithubWebhook({
  app,
  event,
  payload,
  deliveryId,
}: GithubWebhookInput): Promise<void> {
  if (!isObject(payload)) {
    console.warn(`GitHub webhook ${deliveryId}: payload is not an object`);
    return;
  }

  if (event === "ping") {
    console.info(`GitHub webhook ${deliveryId}: ping received`);
    return;
  }

  if (event === "installation") {
    await handleInstallationEvent({
      action: stringAt(payload, "action") ?? "",
      payload,
      deliveryId,
    });
    return;
  }

  if (event === "installation_repositories") {
    await handleInstallationRepositoriesEvent({
      action: stringAt(payload, "action") ?? "",
      payload,
      deliveryId,
    });
    return;
  }

  if (event === "pull_request") {
    try {
      await handlePullRequestEvent({
        app,
        action: stringAt(payload, "action") ?? "",
        payload,
        deliveryId,
      });
    } catch (error) {
      // A review failure must not make GitHub disable the webhook. The review
      // pipeline already publishes a neutral check run when it can.
      console.error(
        `GitHub webhook ${deliveryId}: pull request handling failed`,
        errorMessage(error),
      );
    }
  }
}
