export type FindingSource = "principles" | "commit";

export type Finding = {
  source: FindingSource;
  ruleId: string | null;
  commitSha: string | null;
  file: string | null;
  line: number | null;
  severity: "error" | "warning" | "info";
  message: string;
};

export type CheckResult =
  | { ok: true; findings: Finding[] }
  | { ok: false; error: string };
