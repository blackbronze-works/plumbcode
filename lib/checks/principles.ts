import type { Rule } from "@/lib/principles";
import { toFinding } from "./findings";
import { runModelFindings } from "./model";
import type { CheckResult } from "./types";

export function renderRules(rules: Rule[]) {
  return rules.map((rule) => `[${rule.id}] ${rule.text}`).join("\n");
}

export async function runPrinciplesCheck({
  rules,
  diff,
  changedFiles,
}: {
  rules: Rule[];
  diff: string;
  changedFiles: Set<string>;
}): Promise<CheckResult> {
  if (rules.length === 0 || !diff.trim()) {
    return { ok: true, findings: [] };
  }

  const result = await runModelFindings(`Check this pull request against the repository rules below.

Only report a rule violation when the diff plainly breaks that rule. Do not report general style preferences that the rules do not state. Each finding must use the rule ID exactly as written, and must include a file path from the diff and a line number when one can be identified.

Rules:
${renderRules(rules)}

Pull request diff:
${diff}`);

  if (!result.ok) return result;

  const knownRules = new Set(rules.map((rule) => rule.id));
  const findings = result.findings.flatMap((raw) => {
    const ruleId =
      typeof raw.ruleId === "string" ? raw.ruleId.trim() : "";

    if (!knownRules.has(ruleId)) return [];

    const finding = toFinding({
      source: "principles",
      raw,
      changedFiles,
      ruleId,
    });

    return finding ? [finding] : [];
  });

  return { ok: true, findings };
}
