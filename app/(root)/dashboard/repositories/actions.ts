"use server";

import {
  MAX_MARKDOWN_LENGTH,
  serializePrinciples,
  validateRuleInputs,
} from "@/lib/principles";
import {
  deletePrincipleSet,
  savePrincipleSet,
} from "@/lib/principles-store";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export type SavePrinciplesResult =
  | { ok: true }
  | { ok: false; errors: string[] };

type SavePrinciplesInput = {
  installationId: number;
  repoFullName: string;
  rules: string[];
};

const REPO_FULL_NAME = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

export async function savePrinciples({
  installationId,
  repoFullName,
  rules,
}: SavePrinciplesInput): Promise<SavePrinciplesResult> {
  const session = await requireSession();

  if (!Number.isInteger(installationId) || installationId <= 0) {
    return { ok: false, errors: ["Installation not found."] };
  }

  if (
    typeof repoFullName !== "string" ||
    !REPO_FULL_NAME.test(repoFullName)
  ) {
    return { ok: false, errors: ["Repository not found."] };
  }

  if (!Array.isArray(rules)) {
    return { ok: false, errors: ["Invalid rules."] };
  }

  // The installation must belong to this user, and the repo must sit under
  // that installation's account.
  const installation = await prisma.installation.findFirst({
    where: { id: installationId, userId: session.user.id },
    select: { accountLogin: true },
  });

  if (!installation) {
    return { ok: false, errors: ["Installation not found."] };
  }

  const owner = repoFullName.split("/")[0];

  if (owner.toLowerCase() !== installation.accountLogin.toLowerCase()) {
    return { ok: false, errors: ["Repository not found."] };
  }

  const inputErrors = validateRuleInputs(rules);

  if (inputErrors.length > 0) {
    return { ok: false, errors: inputErrors };
  }

  // Removing every rule is allowed and clears the repository's set.
  if (rules.length === 0) {
    await deletePrincipleSet(installationId, repoFullName);
    return { ok: true };
  }

  const markdown = serializePrinciples(rules.map((rule) => rule.trim()));

  if (markdown.length > MAX_MARKDOWN_LENGTH) {
    return { ok: false, errors: ["Principles are too long."] };
  }

  await savePrincipleSet(installationId, repoFullName, markdown);

  return { ok: true };
}
