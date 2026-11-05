import { prisma } from "@/lib/prisma";
import { parsePrinciples, type Rule } from "@/lib/principles";

export async function savePrincipleSet(
  installationId: number,
  repoFullName: string,
  markdown: string,
) {
  return prisma.principleSet.upsert({
    where: {
      installationId_repoFullName: { installationId, repoFullName },
    },
    create: { installationId, repoFullName, markdown },
    update: { markdown, version: { increment: 1 } },
  });
}

export async function deletePrincipleSet(
  installationId: number,
  repoFullName: string,
) {
  await prisma.principleSet.deleteMany({
    where: { installationId, repoFullName },
  });
}

/**
 * Rules for the review pipeline. A repo-specific set wins over the reserved
 * "*" installation-wide default. Invalid markdown is treated as "no rules" so
 * a bad save can never break pull-request checks.
 */
export async function loadRules(
  installationId: number,
  repoFullName: string,
): Promise<Rule[]> {
  const sets = await prisma.principleSet.findMany({
    where: {
      installationId,
      repoFullName: { in: [repoFullName, "*"] },
    },
    select: { repoFullName: true, markdown: true },
  });

  const set =
    sets.find((item) => item.repoFullName === repoFullName) ??
    sets.find((item) => item.repoFullName === "*");

  if (!set) return [];

  const parsed = parsePrinciples(set.markdown);

  return parsed.ok ? parsed.rules : [];
}
