import { z } from "zod";
import { generateJson } from "./gemini";

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

const MAX_PROMPT_LENGTH = 120_000;
const MAX_FINDINGS = 50;

const SYSTEM_INSTRUCTION =
  "You are Plumbcode, an advisory code reviewer. Report only clear, actionable problems that are supported by the supplied diff. Never invent files, lines, rules, or commits. Return only JSON that matches the provided schema.";

const RawFindingSchema = z.object({
  ruleId: z
    .string()
    .nullish()
    .describe(
      "The rule ID exactly as shown in the rules list, for example Rule-1.",
    ),
  commitSha: z
    .string()
    .nullish()
    .describe(
      "The full or abbreviated SHA of the commit the finding belongs to.",
    ),
  file: z
    .string()
    .nullish()
    .describe("A repository-relative file path from the diff."),
  line: z
    .number()
    .int()
    .min(1)
    .nullish()
    .describe("The 1-based line number in the new version of the file."),
  severity: z
    .enum(["error", "warning", "info"])
    .nullish()
    .describe("How important the finding is."),
  message: z
    .string()
    .describe("A short, specific explanation of the problem."),
});

const FindingsSchema = z.object({
  findings: z
    .array(RawFindingSchema)
    .describe(
      "The review findings. Return an empty array when nothing is wrong.",
    ),
});

const findingsJsonSchema = z.toJSONSchema(FindingsSchema);
delete findingsJsonSchema.$schema;

function truncatePrompt(prompt: string): string {
  if (prompt.length <= MAX_PROMPT_LENGTH) return prompt;

  return `${prompt.slice(0, MAX_PROMPT_LENGTH)}\n\n[Prompt truncated because it exceeded the size limit.]`;
}

export async function runModelFindings(prompt: string): Promise<ModelResult> {
  const result = await generateJson({
    prompt: truncatePrompt(prompt),
    jsonSchema: findingsJsonSchema,
    systemInstruction: SYSTEM_INSTRUCTION,
  });

  if (!result.ok) return result;

  if (!result.text.trim()) {
    console.error("Plumbcode model: response was empty");
    return { ok: false, error: "model_invalid_response" };
  }

  let body: unknown;
  try {
    body = JSON.parse(result.text);
  } catch {
    console.error("Plumbcode model: response was not valid JSON");
    return { ok: false, error: "model_invalid_response" };
  }

  const parsed = FindingsSchema.safeParse(body);
  if (!parsed.success) {
    console.error("Plumbcode model: response did not match the findings schema");
    return { ok: false, error: "model_invalid_response" };
  }

  return {
    ok: true,
    findings: parsed.data.findings.slice(0, MAX_FINDINGS),
  };
}
