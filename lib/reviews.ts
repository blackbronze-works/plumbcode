import type { Finding } from "@/lib/checks/types";
import type { Rule } from "@/lib/principles";
import { prisma } from "@/lib/prisma";

export type SaveReviewInput = {
  installationId: number;
  repoFullName: string;
  prNumber: number;
  prTitle: string | null;
  headSha: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  commitsChecked: number;
  commitsSkipped: number;
  rules: Rule[];
  findings: Finding[];
};

const MAX_TITLE_LENGTH = 200;

function findingTitle(finding: Finding): string {
  if (finding.ruleId) {
    return finding.ruleId.slice(0, MAX_TITLE_LENGTH);
  }

  if (finding.commitSha) {
    return `Commit ${finding.commitSha.slice(0, 7)}`.slice(
      0,
      MAX_TITLE_LENGTH,
    );
  }

  return finding.source === "commit" ? "Commit message" : "Finding";
}

/**
 * Persists a completed review as metadata only. Findings deliberately omit
 * the model's message: it can quote code, and Plumbcode stores results rather
 * than source.
 */
export async function saveReview(input: SaveReviewInput): Promise<void> {
  const { installationId, repoFullName, prNumber, headSha, rules, findings } =
    input;

  const textById = new Map(rules.map((rule) => [rule.id, rule.text]));
  const prTitle =
    input.prTitle?.trim().slice(0, MAX_TITLE_LENGTH) ||
    `Pull request #${prNumber}`;

  const data = {
    installationId,
    repoFullName,
    prNumber,
    prTitle,
    headSha,
    additions: input.additions,
    deletions: input.deletions,
    changedFiles: input.changedFiles,
    commitsChecked: input.commitsChecked,
    commitsSkipped: input.commitsSkipped,
    rulesChecked: rules.length,
    findingCount: findings.length,
  };

  await prisma.$transaction(async (tx) => {
    const review = await tx.review.upsert({
      where: {
        installationId_repoFullName_prNumber_headSha: {
          installationId,
          repoFullName,
          prNumber,
          headSha,
        },
      },
      create: data,
      update: data,
    });

    await tx.reviewFinding.deleteMany({ where: { reviewId: review.id } });

    if (findings.length > 0) {
      await tx.reviewFinding.createMany({
        data: findings.map((finding) => ({
          reviewId: review.id,
          repoFullName,
          source: finding.source,
          ruleId: finding.ruleId,
          ruleText: finding.ruleId
            ? (textById.get(finding.ruleId) ?? null)
            : null,
          commitSha: finding.commitSha,
          severity: finding.severity,
          title: findingTitle(finding),
          file: finding.file,
          line: finding.line,
        })),
      });
    }
  });
}
