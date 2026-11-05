import type { RawFinding } from "./model";
import type { Finding, FindingSource } from "./types";

export function normalizeFile(
  value: unknown,
  changedFiles: Set<string>,
): string | null {
  if (typeof value !== "string") return null;

  const file = value
    .trim()
    .replace(/^[ab]\//, "")
    .replace(/^\.\//, "")
    .replace(/\\/g, "/");

  return changedFiles.has(file) ? file : null;
}

export function normalizeLine(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    return null;
  }

  return value <= 10_000_000 ? value : null;
}

export function normalizeSeverity(value: unknown): Finding["severity"] {
  return value === "error" || value === "warning" || value === "info"
    ? value
    : "warning";
}

export function normalizeMessage(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const message = value.trim();
  if (!message) return null;

  return message.length > 2_000 ? `${message.slice(0, 2_000)}…` : message;
}

export function toFinding({
  source,
  raw,
  changedFiles,
  ruleId = null,
  commitSha = null,
}: {
  source: FindingSource;
  raw: RawFinding;
  changedFiles: Set<string>;
  ruleId?: string | null;
  commitSha?: string | null;
}): Finding | null {
  const message = normalizeMessage(raw.message);
  if (!message) return null;

  return {
    source,
    ruleId,
    commitSha,
    file: normalizeFile(raw.file, changedFiles),
    line: normalizeLine(raw.line),
    severity: normalizeSeverity(raw.severity),
    message,
  };
}
