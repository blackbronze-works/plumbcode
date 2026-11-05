import { toFinding } from "./findings";
import { runModelFindings } from "./model";
import type { CheckResult } from "./types";

export type CommitInput = {
  sha: string;
  message: string;
  diff: string;
};

function resolveSha(value: unknown, commits: CommitInput[]): string | null {
  if (typeof value !== "string") return null;

  const raw = value.trim().toLowerCase();
  if (!raw) return null;

  const exact = commits.find((commit) => commit.sha.toLowerCase() === raw);
  if (exact) return exact.sha;

  return (
    commits.find((commit) => commit.sha.toLowerCase().startsWith(raw))?.sha ??
    null
  );
}

export async function runCommitCheck({
  commits,
  changedFiles,
}: {
  commits: CommitInput[];
  changedFiles: Set<string>;
}): Promise<CheckResult> {
  if (commits.length === 0) return { ok: true, findings: [] };

  const sections = commits
    .filter((commit) => commit.diff.trim())
    .map((commit) => {
      const message =
        commit.message.length > 4_000
          ? `${commit.message.slice(0, 4_000)}\n[Message truncated.]`
          : commit.message;

      return `<commit sha="${commit.sha}">
Message:
${message}

Diff:
${commit.diff}
</commit>`;
    });

  if (sections.length === 0) return { ok: true, findings: [] };

  const result = await runModelFindings(`Compare each commit message with the changes in that commit's diff.

Report only clear mismatches: a message that claims something the diff does not do, omits a major part of the change, or is too vague for a non-trivial diff. Do not nitpick wording. Each finding must include the commit SHA exactly as shown below, and a file path from that commit's diff and a line number when one can be identified.

${sections.join("\n\n")}`);

  if (!result.ok) return result;

  const findings = result.findings.flatMap((raw) => {
    const commitSha = resolveSha(raw.commitSha, commits);
    if (!commitSha) return [];

    const finding = toFinding({
      source: "commit",
      raw,
      changedFiles,
      commitSha,
    });

    return finding ? [finding] : [];
  });

  return { ok: true, findings };
}
