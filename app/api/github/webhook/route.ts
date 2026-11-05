import { after } from "next/server";
import { getGithubApp, type GithubApp } from "@/lib/github-app-auth";
import { handleGithubWebhook } from "@/lib/github-webhook";

// The review pipeline uses Node APIs (crypto for the GitHub App JWT) and makes
// long-running GitHub and model requests.
export const runtime = "nodejs";
export const maxDuration = 300;

function json(body: Record<string, unknown>, status: number) {
  return Response.json(body, { status });
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "unknown error";
}

function readWebhook(
  request: Request,
  app: GithubApp,
): Promise<
  | { ok: true; event: string; deliveryId: string; payload: unknown }
  | { ok: false; response: Response }
> {
  return (async () => {
    const signature = request.headers.get("x-hub-signature-256");
    const event = request.headers.get("x-github-event")?.trim();
    const deliveryId =
      request.headers.get("x-github-delivery")?.trim() || "unknown";

    if (!signature || !event) {
      return {
        ok: false,
        response: json({ error: "invalid_webhook_request" }, 400),
      };
    }

    const rawBody = await request.text();
    if (!rawBody) {
      return {
        ok: false,
        response: json({ error: "empty_payload" }, 400),
      };
    }

    let verified = false;
    try {
      verified = await app.webhooks.verify(rawBody, signature);
    } catch (error) {
      console.warn(
        `GitHub webhook ${deliveryId}: signature verification errored`,
        errorMessage(error),
      );
    }

    if (!verified) {
      return {
        ok: false,
        response: json({ error: "invalid_signature" }, 401),
      };
    }

    let payload: unknown;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return {
        ok: false,
        response: json({ error: "invalid_json" }, 400),
      };
    }

    return { ok: true, event, deliveryId, payload };
  })();
}

export async function POST(request: Request) {
  const app = getGithubApp();
  if (!app) {
    return json({ error: "github_app_not_configured" }, 500);
  }

  const webhook = await readWebhook(request, app);
  if (!webhook.ok) return webhook.response;

  const { event, deliveryId, payload } = webhook;

  // GitHub expects a prompt 2xx. Pull-request reviews fetch diffs, call the
  // model, and publish check runs, so they run after this response is sent.
  if (event === "pull_request") {
    after(async () => {
      await handleGithubWebhook({ app, event, payload, deliveryId });
    });

    return json({ ok: true, accepted: true }, 202);
  }

  // Installation events write to the database. If that fails, a non-2xx
  // response lets GitHub retry the delivery instead of losing the link.
  try {
    await handleGithubWebhook({ app, event, payload, deliveryId });
  } catch (error) {
    console.error(
      `GitHub webhook ${deliveryId}: handling ${event} failed`,
      errorMessage(error),
    );
    return json({ error: "webhook_processing_failed" }, 500);
  }

  return json({ ok: true }, 200);
}
