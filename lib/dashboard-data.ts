import { prisma } from "@/lib/prisma";

const DAY = 86_400_000;
const WINDOW_DAYS = 30;
const CHART_DAYS = 14;
const MAX_REVIEW_ROWS = 1000;

export type RepoRow = {
  installationId: number;
  repoFullName: string;
  prs: number;
  findings: number;
  additions: number;
  deletions: number;
};

export type RecentReview = {
  installationId: number;
  repoFullName: string;
  prNumber: number;
  prTitle: string;
  additions: number;
  deletions: number;
  findingCount: number;
  createdAt: Date;
};

export type TopRule = {
  repoFullName: string;
  ruleId: string;
  ruleText: string | null;
  count: number;
};

export type DailyCount = {
  key: string;
  label: string;
  count: number;
};

export type DashboardData = {
  days: number;
  chartDays: number;
  hasAnyReview: boolean;
  prsReviewed: number;
  findings: number;
  cleanRate: number | null;
  additions: number;
  deletions: number;
  daily: DailyCount[];
  repos: RepoRow[];
  recent: RecentReview[];
  topRules: TopRule[];
};

export type RepoActivity = {
  reviews: number;
  findings: number;
  lastReviewAt: Date | null;
};

export async function getDashboardData(
  installationIds: number[],
): Promise<DashboardData> {
  const now = Date.now();
  const since = new Date(now - WINDOW_DAYS * DAY);
  const where = {
    installationId: { in: installationIds },
    createdAt: { gte: since },
  };

  const reviews = await prisma.review.findMany({
    where,
    orderBy: { createdAt: "desc" },
    // Safety cap for unusually busy installations. The 30-day window keeps
    // this result set small for normal use.
    take: MAX_REVIEW_ROWS,
    select: {
      id: true,
      installationId: true,
      repoFullName: true,
      prNumber: true,
      prTitle: true,
      additions: true,
      deletions: true,
      findingCount: true,
      createdAt: true,
    },
  });

  // A PR can be reviewed on every push. Count each PR once, by its latest
  // review, and use the same set for findings, repository rows, and top rules.
  const latest = new Map<string, (typeof reviews)[number]>();
  for (const review of reviews) {
    const key = `${review.installationId}:${review.repoFullName}#${review.prNumber}`;
    if (!latest.has(key)) latest.set(key, review); // newest first
  }
  const prs = [...latest.values()];
  const latestIds = prs.map((pr) => pr.id);

  const ruleGroups =
    latestIds.length > 0
      ? await prisma.reviewFinding.groupBy({
          by: ["repoFullName", "ruleId", "ruleText"],
          where: {
            ruleId: { not: null },
            reviewId: { in: latestIds },
          },
          _count: { _all: true },
          orderBy: [
            { _count: { ruleId: "desc" } },
            { ruleId: "asc" },
          ],
          take: 5,
        })
      : [];

  let hasAnyReview = prs.length > 0;

  if (!hasAnyReview && installationIds.length > 0) {
    const existingReview = await prisma.review.findFirst({
      where: { installationId: { in: installationIds } },
      select: { id: true },
    });
    hasAnyReview = Boolean(existingReview);
  }

  const repoMap = new Map<string, RepoRow>();
  for (const pr of prs) {
    const key = `${pr.installationId}:${pr.repoFullName}`;
    const row = repoMap.get(key) ?? {
      installationId: pr.installationId,
      repoFullName: pr.repoFullName,
      prs: 0,
      findings: 0,
      additions: 0,
      deletions: 0,
    };

    row.prs += 1;
    row.findings += pr.findingCount;
    row.additions += pr.additions;
    row.deletions += pr.deletions;
    repoMap.set(key, row);
  }

  const buckets = new Map<string, number>();
  for (let i = CHART_DAYS - 1; i >= 0; i--) {
    const key = new Date(now - i * DAY).toISOString().slice(0, 10);
    buckets.set(key, 0);
  }

  for (const review of reviews) {
    const key = review.createdAt.toISOString().slice(0, 10);
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
  }

  // Review rows don't store check status, so a partial review with zero
  // findings still counts as clean. Add a status field before tightening this.
  const cleanPrs = prs.filter((pr) => pr.findingCount === 0).length;

  return {
    days: WINDOW_DAYS,
    chartDays: CHART_DAYS,
    hasAnyReview,
    prsReviewed: prs.length,
    findings: prs.reduce((sum, pr) => sum + pr.findingCount, 0),
    cleanRate: prs.length ? Math.round((cleanPrs / prs.length) * 100) : null,
    additions: prs.reduce((sum, pr) => sum + pr.additions, 0),
    deletions: prs.reduce((sum, pr) => sum + pr.deletions, 0),
    daily: [...buckets].map(([key, count]) => ({
      key,
      count,
      label: new Date(`${key}T00:00:00Z`).toLocaleDateString("en-US", {
        weekday: "short",
        timeZone: "UTC",
      }),
    })),
    repos: [...repoMap.values()].sort(
      (a, b) =>
        b.prs - a.prs || a.repoFullName.localeCompare(b.repoFullName),
    ),
    recent: prs.slice(0, 6).map((pr) => ({
      installationId: pr.installationId,
      repoFullName: pr.repoFullName,
      prNumber: pr.prNumber,
      prTitle: pr.prTitle,
      additions: pr.additions,
      deletions: pr.deletions,
      findingCount: pr.findingCount,
      createdAt: pr.createdAt,
    })),
    topRules: ruleGroups.flatMap((group) =>
      group.ruleId
        ? [
            {
              repoFullName: group.repoFullName,
              ruleId: group.ruleId,
              ruleText: group.ruleText,
              count: group._count._all,
            },
          ]
        : [],
    ),
  };
}

// All-time review counts per repository, for the Repositories page.
export async function getRepoActivity(
  installationIds: number[],
): Promise<Map<string, RepoActivity>> {
  if (installationIds.length === 0) {
    return new Map();
  }

  const groups = await prisma.review.groupBy({
    by: ["installationId", "repoFullName"],
    where: { installationId: { in: installationIds } },
    _count: { _all: true },
    _sum: { findingCount: true },
    _max: { createdAt: true },
  });

  return new Map(
    groups.map((group) => [
      `${group.installationId}:${group.repoFullName}`,
      {
        reviews: group._count._all,
        findings: group._sum.findingCount ?? 0,
        lastReviewAt: group._max.createdAt,
      },
    ]),
  );
}
