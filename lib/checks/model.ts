export type RawFinding = {
  ruleId?: unknown;
  commitSha?: unknown;
  file?: unknown;
  line?: unknown;
  severity?: unknown;
  message?: unknown;
};

export type ModelResult =
  | { ok: true; findings: RawFinding[] }
  | {
      ok: false;
      error:
        | "model_not_configured"
        | "model_request_failed"
        | "model_timeout"
        | "model_invalid_response";
    };

const MODEL_TIMEOUT_MS = 60_000;
const MAX_PROMPT_LENGTH = 120_000;

const FINDINGS_TOOL = {
  name: "report_findings",
  description:
    "Report the review findings. Return an empty findings array when nothing is wrong.",
  input_schema: {
    type: "object",
    properties: {
      findings: {
        type: "array",
        items: {
          type: "object",
          properties: {
            ruleId: {
              type: "string",
              description:
                "The rule ID exactly as shown in the rules list, for example Rule-1.",
            },
            commitSha: {
              type: "string",
              description:
                "The full or abbreviated SHA of the commit the finding belongs to.",
            },
            file: {
              type: "string",
              description: "A repository-relative file path from the diff.",
            },
            line: {
              type: "integer",
              description: "The 1-based line number in the new version of the file.",
            },
            severity: {
              type: "string",
              enum: ["error", "warning", "info"],
            },
            message: {
              type: "string",
              description: "A short, specific explanation of the problem.",
            },
          },
          required: ["message"],
        },
      },
    },
    required: ["findings"],
  },
} as const;

type ModelConfig = {
  apiKey: string;
  model: string;
  baseUrl: string;
};

function getModelConfig(): ModelConfig | null {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) return null;

  const configuredModel = process.env.PLUMBCODE_MODEL?.trim();
  const model = (configuredModel || "claude-sonnet-5-5")
    .replace(/^["']|["']$/g, "")
    .split(/\s+#/)[0]
    .trim();

  if (!model) return null;

  const baseUrl =
    process.env.ANTHROPIC_BASE_URL?.trim().replace(/\/+$/, "") ||
    "https://api.anthropic.com";

  return { apiKey, model, baseUrl };
}

function truncatePrompt(prompt: string): string {
  if (prompt.length <= MAX_PROMPT_LENGTH) return prompt;

  return `${prompt.slice(0, MAX_PROMPT_LENGTH)}\n\n[Prompt truncated because it exceeded the size limit.]`;
}

export async function runModelFindings(prompt: string): Promise<ModelResult> {
  const config = getModelConfig();
  if (!config) return { ok: false, error: "model_not_configured" };

  let response: Response;
  try {
    response = await fetch(`${config.baseUrl}/v1/messages`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": config.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: 4096,
        temperature: 0,
        system:
          "You are Plumbcode, an advisory code reviewer. Report only clear, actionable problems that are supported by the supplied diff. Never invent files, lines, rules, or commits. Return findings through the report_findings tool.",
        messages: [
          {
            role: "user",
            content: truncatePrompt(prompt),
          },
        ],
        tools: [FINDINGS_TOOL],
        tool_choice: { type: "tool", name: FINDINGS_TOOL.name },
      }),
      signal: AbortSignal.timeout(MODEL_TIMEOUT_MS),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      console.error("Plumbcode model: request timed out");
      return { ok: false, error: "model_timeout" };
    }

    console.error(
      "Plumbcode model: request failed",
      error instanceof Error ? error.message : "unknown error",
    );
    return { ok: false, error: "model_request_failed" };
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as
      | { error?: { type?: string } }
      | null;

    console.error("Plumbcode model: GitHub returned an error", {
      status: response.status,
      type: body?.error?.type ?? "unknown",
    });

    return { ok: false, error: "model_request_failed" };
  }

  const body = (await response.json().catch(() => null)) as
    | {
        content?: Array<{
          type?: string;
          name?: string;
          input?: unknown;
        }>;
      }
    | null;

  const toolUse = body?.content?.find(
    (block) => block.type === "tool_use" && block.name === FINDINGS_TOOL.name,
  );

  const input = toolUse?.input;
  if (!input || typeof input !== "object" || !("findings" in input)) {
    console.error("Plumbcode model: response did not include findings");
    return { ok: false, error: "model_invalid_response" };
  }

  const findings = (input as { findings?: unknown }).findings;
  if (!Array.isArray(findings)) {
    console.error("Plumbcode model: findings was not an array");
    return { ok: false, error: "model_invalid_response" };
  }

  return {
    ok: true,
    findings: findings.slice(0, 50).filter(
      (finding): finding is RawFinding =>
        typeof finding === "object" && finding !== null,
    ),
  };
}
