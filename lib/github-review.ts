import type { Octokit } from "octokit";
import { GITHUB_APP_SLUG } from "@/lib/github-app";
import type { GithubApp } from "@/lib/github-app-auth";
import { runCommitCheck, type CommitInput } from "@/lib/checks/commit";
import {
  collectChangedLineRanges,
  isLineInDiff,
  renderFilesDiff,
  type DiffFile,
} from "@/lib/checks/diff";
import { runPrinciplesCheck } from "@/lib/checks/principles";
import type { Finding } from "@/lib/checks/types";
import { loadRules } from "@/lib/principles-store";
import { saveReview } from "@/lib/reviews";

const CHECK_NAME = "Plumbcode";
const COMMENT_MARKER = "<!-- plumbcode-review -->";
const MAX_COMMITS = 10;

type CheckRunConclusion =
  | "success"
  | "neutral"
  | "failure"
  | "action_required"
  | "cancelled"
  | "skipped"
  | "timed_out";

type Annotation = {
  path: string;
  start_line: number;
  end_line: number;
  annotation_level: "notice" | "warning" | "failure";
  message: string;
  title: string;
};

type CheckRunState = {
  status: "in_progress" | "completed";
  conclusion?: CheckRunConclusion;
  title: string;
  summary: string;
  text?: string;
  annotations?: Annotation[];
};

type PullRequestFile = {
  filename: string;
  status?: string;
  patch?: string | null;
};

type PullRequestCommit = {
  sha: string;
  message: string;
  parents: number;
};

type ReviewInput = {
  app: GithubApp;
  installationId: number;
  owner: string;
  repo: string;
  pullNumber: number;
  headSha: string;
  deliveryId: string;
  prTitle: string | null;
  additions: number;
  deletions: number;
  changedFileCount: number | null;
};

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "unknown error";
}

async function findCheckRun(
  octokit: Octokit,
  owner: string,
  repo: string,
  headSha: string,
) {
  const runs = await octokit.paginate(
    "GET /repos/{owner}/{repo}/commits/{ref}/check-runs",
    {
      owner,
      repo,
      ref: headSha,
      check_name: CHECK_NAME,
      filter: "all",
      per_page: 100,
    },
  );

  return (
    runs.find(
      (run) =>
        run.name === CHECK_NAME &&
        (!GITHUB_APP_SLUG || run.app?.slug === GITHUB_APP_SLUG),
    ) ?? null
  );
}

async function upsertCheckRun(
  octokit: Octokit,
  {
    owner,
    repo,
    headSha,
    state,
  }: {
    owner: string;
    repo: string;
    headSha: string;
    state: CheckRunState;
  },
) {
  const existing = await findCheckRun(octokit, owner, repo, headSha);

  const output = {
    title: state.title.slice(0, 255),
    summary: state.summary.slice(0, 65_535),
    text: (state.text ?? state.summary).slice(0, 65_535),
    ...(state.annotations?.length
      ? { annotations: state.annotations.slice(0, 50) }
      : {}),
  };

  if (existing) {
    await octokit.request(
      "PATCH /repos/{owner}/{repo}/check-runs/{check_run_id}",
      {
        owner,
        repo,
        check_run_id: existing.id,
        status: state.status,
        ...(state.status === "completed"
          ? {
              conclusion: state.conclusion ?? "neutral",
              completed_at: new Date().toISOString(),
            }
          : {}),
        output,
      },
    );
    return;
  }

  await octokit.request("POST /repos/{owner}/{repo}/check-runs", {
    owner,
    repo,
    name: CHECK_NAME,
    head_sha: headSha,
    status: state.status,
    ...(state.status === "completed"
      ? {
          conclusion: state.conclusion ?? "neutral",
          completed_at: new Date().toISOString(),
        }
      : { started_at: new Date().toISOString() }),
    external_id: `${owner}/${repo}@${headSha}`,
    output,
  });
}

async function upsertComment(
  octokit: Octokit,
  {
    owner,
    repo,
    issueNumber,
    body,
    createIfMissing,
  }: {
    owner: string;
    repo: string;
    issueNumber: number;
    body: string;
    createIfMissing: boolean;
  },
) {
  const comments = await octokit.paginate(
    "GET /repos/{owner}/{repo}/issues/{issue_number}/comments",
    {
      owner,
      repo,
      issue_number: issueNumber,
      per_page: 100,
    },
  );

  const existing = comments.find((comment) =>
    comment.body?.includes(COMMENT_MARKER),
  );

  const trimmedBody = body.slice(0, 60_000);

  if (existing) {
    await octokit.request(
      "PATCH /repos/{owner}/{repo}/issues/comments/{comment_id}",
      {
        owner,
        repo,
        comment_id: existing.id,
        body: trimmedBody,
      },
    );
    return;
  }

  if (!createIfMissing) return;

  await octokit.request(
    "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
    {
      owner,
      repo,
      issue_number: issueNumber,
      body: trimmedBody,
    },
  );
}

async function fetchPullFiles(
  octokit: Octokit,
  owner: string,
  repo: string,
  pullNumber: number,
): Promise<PullRequestFile[]> {
  const files = await octokit.paginate(
    "GET /repos/{owner}/{repo}/pulls/{pull_number}/files",
    {
      owner,
      repo,
      pull_number: pullNumber,
      per_page: 100,
    },
  );

  return files.map((file) => ({
    filename: file.filename,
    status: file.status,
    patch: file.patch ?? null,
  }));
}

async function fetchPullCommits(
  octokit: Octokit,
  owner: string,
  repo: string,
  pullNumber: number,
): Promise<PullRequestCommit[]> {
  const commits = await octokit.paginate(
    "GET /repos/{owner}/{repo}/pulls/{pull_number}/commits",
    {
      owner,
      repo,
      pull_number: pullNumber,
      per_page: 100,
    },
  );

  return commits.map((commit) => ({
    sha: commit.sha,
    message: commit.commit.message,
    parents: commit.parents.length,
  }));
}

async function fetchCommitInputs(
  octokit: Octokit,
  owner: string,
  repo: string,
  commits: PullRequestCommit[],
): Promise<{ inputs: CommitInput[]; skipped: number }> {
  // Merge commits have no single meaningful diff against a message, and the
  // change they introduce is already covered by the commits they merge.
  const eligible = commits.filter((commit) => commit.parents <= 1);
  const selected = eligible.slice(-MAX_COMMITS);

  const results = await Promise.allSettled(
    selected.map(async (commit) => {
      const { data } = await octokit.request(
        "GET /repos/{owner}/{repo}/commits/{ref}",
        {
          owner,
          repo,
          ref: commit.sha,
        },
      );

      const diff = renderFilesDiff(data.files ?? [], 5_000);

      return {
        sha: commit.sha,
        message: commit.message,
        diff: diff.text,
      };
    }),
  );

  const inputs: CommitInput[] = [];
  let failed = 0;

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      inputs.push(result.value);
      return;
    }

    failed += 1;
    console.error(
      `Plumbcode: commit diff fetch failed for ${selected[index].sha.slice(0, 7)}`,
      errorMessage(result.reason),
    );
  });

  return {
    inputs,
    skipped: commits.length - selected.length + failed,
  };
}

function findingHeading(finding: Finding): string {
  const label =
    finding.ruleId ??
    (finding.commitSha ? `Commit ${finding.commitSha.slice(0, 7)}` : "Finding");
  const location = finding.file
    ? ` · \`${finding.file}${finding.line ? `:${finding.line}` : ""}\``
    : "";

  return `**${label}**${location}`;
}

function renderFindings(findings: Finding[]): string {
  return findings
    .map((finding) => `${findingHeading(finding)}\n\n${finding.message}`)
    .join("\n\n");
}

function renderReview({
  findings,
  failures,
  notes,
  rulesConfigured,
}: {
  findings: Finding[];
  failures: string[];
  notes: string[];
  rulesConfigured: boolean;
}): string {
  const lines = [COMMENT_MARKER, "## Plumbcode review", ""];

  if (findings.length > 0) {
    lines.push(
      `Found **${findings.length}** advisory finding${findings.length === 1 ? "" : "s"}.`,
      "",
      renderFindings(findings),
      "",
    );
  } else {
    lines.push("**No violations found.**", "");
  }

  if (failures.length > 0) {
    lines.push(
      `The ${failures.join(" and ")} check${failures.length === 1 ? "" : "s"} couldn't run, so this review is incomplete.`,
      "",
    );
  }

  if (!rulesConfigured) {
    lines.push(
      "No principles are configured for this repository, so only commit messages were checked.",
      "",
    );
  }

  for (const note of notes) {
    lines.push(note, "");
  }

  lines.push(
    "<sub>Plumbcode is advisory. Findings do not block merging.</sub>",
  );

  return lines.join("\n");
}

function buildAnnotations(
  findings: Finding[],
  changedRanges: Map<string, Array<[number, number]>>,
): Annotation[] {
  return findings
    .flatMap((finding) => {
      if (!finding.file || !finding.line) return [];
      if (!isLineInDiff(changedRanges, finding.file, finding.line)) return [];

      return [
        {
          path: finding.file,
          start_line: finding.line,
          end_line: finding.line,
          annotation_level: "warning" as const,
          message: finding.message.slice(0, 2_000),
          title: (
            finding.ruleId ??
            (finding.commitSha
              ? `Commit ${finding.commitSha.slice(0, 7)}`
              : "Plumbcode")
          ).slice(0, 255),
        },
      ];
    })
    .slice(0, 50);
}

async function markReviewUnavailable(
  octokit: Octokit,
  {
    owner,
    repo,
    pullNumber,
    headSha,
  }: {
    owner: string;
    repo: string;
    pullNumber: number;
    headSha: string;
  },
) {
  const summary =
    "The review service is unavailable. Plumbcode will try again when the pull request is updated.";

  await upsertCheckRun(octokit, {
    owner,
    repo,
    headSha,
    state: {
      status: "completed",
      conclusion: "neutral",
      title: "Plumbcode couldn't review this pull request",
      summary,
      text: summary,
    },
  });

  await upsertComment(octokit, {
    owner,
    repo,
    issueNumber: pullNumber,
    body: `${COMMENT_MARKER}\n## Plumbcode review\n\n${summary}`,
    createIfMissing: false,
  });
}

export async function reviewPullRequest(input: ReviewInput): Promise<void> {
  const octokit = await input.app.getInstallationOctokit(input.installationId);

  try {
    await upsertCheckRun(octokit, {
      owner: input.owner,
      repo: input.repo,
      headSha: input.headSha,
      state: {
        status: "in_progress",
        title: "Reviewing pull request",
        summary: "Plumbcode is reading the diff and your rules.",
      },
    }).catch((error) => {
      console.error(
        `Plumbcode: could not start check run (${input.deliveryId})`,
        errorMessage(error),
      );
    });

    const repoFullName = `${input.owner}/${input.repo}`;

    const [rules, files, commits] = await Promise.all([
      loadRules(input.installationId, repoFullName),
      fetchPullFiles(octokit, input.owner, input.repo, input.pullNumber),
      fetchPullCommits(octokit, input.owner, input.repo, input.pullNumber),
    ]);

    const changedFiles = new Set(files.map((file) => file.filename));
    const diff = renderFilesDiff(files);
    const commitReview = await fetchCommitInputs(
      octokit,
      input.owner,
      input.repo,
      commits,
    );

    const [principlesResult, commitResult] = await Promise.all([
      runPrinciplesCheck({
        rules,
        diff: diff.text,
        changedFiles,
      }),
      runCommitCheck({
        commits: commitReview.inputs,
        changedFiles,
      }),
    ]);

    const findings = [
      ...(principlesResult.ok ? principlesResult.findings : []),
      ...(commitResult.ok ? commitResult.findings : []),
    ];

    const failures: string[] = [];
    if (!principlesResult.ok) failures.push("principles");
    if (!commitResult.ok) failures.push("commit");

    const anyCheckSucceeded =
      commitResult.ok || (rules.length > 0 && principlesResult.ok);

    if (!anyCheckSucceeded) {
      console.error(
        `Plumbcode: both checks failed (${input.deliveryId})`,
        principlesResult.ok ? "" : principlesResult.error,
        commitResult.ok ? "" : commitResult.error,
      );

      await markReviewUnavailable(octokit, {
        owner: input.owner,
        repo: input.repo,
        pullNumber: input.pullNumber,
        headSha: input.headSha,
      });
      return;
    }

    const notes: string[] = [];
    if (diff.truncated) {
      notes.push(
        "The diff was too large, so the principles check only saw part of it.",
      );
    }
    if (commitReview.skipped > 0) {
      notes.push(
        `${commitReview.skipped} commit${commitReview.skipped === 1 ? "" : "s"} were not checked because they were merge commits, the pull request has too many commits, or a commit diff couldn't be loaded.`,
      );
    }

    const findingCount = findings.length;
    const summary =
      findingCount > 0
        ? `${findingCount} advisory finding${findingCount === 1 ? "" : "s"}.`
        : "No violations found.";

    const title =
      findingCount > 0
        ? "Plumbcode found issues"
        : failures.length > 0
          ? "Review incomplete"
          : "Plumbcode review passed";

    const conclusion: CheckRunConclusion =
      findingCount > 0 || failures.length > 0 ? "neutral" : "success";

    const body = renderReview({
      findings,
      failures,
      notes,
      rulesConfigured: rules.length > 0,
    });

    const changedRanges = collectChangedLineRanges(files as DiffFile[]);
    const annotations = buildAnnotations(findings, changedRanges);

    const results = await Promise.allSettled([
      upsertCheckRun(octokit, {
        owner: input.owner,
        repo: input.repo,
        headSha: input.headSha,
        state: {
          status: "completed",
          conclusion,
          title,
          summary,
          text: body,
          annotations,
        },
      }),
      upsertComment(octokit, {
        owner: input.owner,
        repo: input.repo,
        issueNumber: input.pullNumber,
        body,
        createIfMissing: true,
      }),
    ]);

    results.forEach((result) => {
      if (result.status === "rejected") {
        console.error(
          `Plumbcode: could not publish review (${input.deliveryId})`,
          errorMessage(result.reason),
        );
      }
    });

    // The GitHub output is already published, so a database failure must never
    // turn a successful review into a webhook failure. A redelivery for the
    // same head SHA replaces the stored findings through the unique key.
    try {
      await saveReview({
        installationId: input.installationId,
        repoFullName,
        prNumber: input.pullNumber,
        prTitle: input.prTitle,
        headSha: input.headSha,
        additions: input.additions,
        deletions: input.deletions,
        changedFiles: input.changedFileCount ?? files.length,
        commitsChecked: commitReview.inputs.length,
        commitsSkipped: commitReview.skipped,
        rules,
        findings,
      });
    } catch (error) {
      console.error(
        `Plumbcode: could not save review (${input.deliveryId})`,
        errorMessage(error),
      );
    }
  } catch (error) {
    console.error(
      `Plumbcode: review failed (${input.deliveryId})`,
      errorMessage(error),
    );

    await markReviewUnavailable(octokit, {
      owner: input.owner,
      repo: input.repo,
      pullNumber: input.pullNumber,
      headSha: input.headSha,
    }).catch((publishError) => {
      console.error(
        `Plumbcode: could not publish failure check (${input.deliveryId})`,
        errorMessage(publishError),
      );
    });

    throw error;
  }
}
