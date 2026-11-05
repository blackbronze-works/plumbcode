/**
 * Canonical rule format.
 *
 * Every stored PrincipleSet is prompt-ready markdown: a short instruction
 * block for the review model, followed by one block per rule:
 *
 *   Rule-1
 *   Never modify generated files.
 *
 *   Rule-2
 *   Keep server actions in files marked "use server".
 */

export const MAX_RULES = 50;
export const MAX_RULE_LENGTH = 2_000;
export const MAX_MARKDOWN_LENGTH = 50_000;

export const RULES_PREAMBLE = `# Repository review rules

Apply these rules when reviewing every pull request in this repository. Check the diff, the changed files, and the commit messages. For each violation, cite the rule ID (Rule-1, Rule-2, ...) and explain what needs to change.`;

export type Rule = {
  id: string;
  text: string;
};

export type ParseResult =
  | { ok: true; rules: Rule[]; errors: [] }
  | { ok: false; rules: Rule[]; errors: string[] };

const RULE_MARKER = /^Rule-(\d+)\s*$/i;

export function parsePrinciples(markdown: string): ParseResult {
  const lines = markdown
    .replace(/^\uFEFF/, "")
    .replace(/\r\n?/g, "\n")
    .split("\n");

  const rules: Rule[] = [];
  const errors: string[] = [];

  let current: { number: number; lines: string[] } | null = null;

  const flush = () => {
    if (!current) return;
    const text = current.lines.join("\n").trim();
    rules.push({ id: `Rule-${current.number}`, text });
    current = null;
  };

  for (const line of lines) {
    const marker = line.match(RULE_MARKER);

    if (marker) {
      flush();
      current = { number: Number(marker[1]), lines: [] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  flush();

  if (rules.length === 0) {
    errors.push("Add at least one rule (Rule-1, Rule-2, ...).");
    return { ok: false, rules, errors };
  }

  if (rules.length > MAX_RULES) {
    errors.push(`Add at most ${MAX_RULES} rules.`);
  }

  const numbers = rules.map((rule) => Number(rule.id.slice("Rule-".length)));

  if (new Set(numbers).size !== numbers.length) {
    errors.push("Rule numbers must be unique.");
  } else if (numbers.some((number, index) => number !== index + 1)) {
    errors.push("Rules must be numbered Rule-1, Rule-2, ... in order.");
  }

  rules.forEach((rule) => {
    if (!rule.text) errors.push(`${rule.id} is empty.`);
  });

  const uniqueErrors = [...new Set(errors)];

  return uniqueErrors.length === 0
    ? { ok: true, rules, errors: [] }
    : { ok: false, rules, errors: uniqueErrors };
}

export function serializePrinciples(rules: string[]): string {
  const blocks = rules.map(
    (rule, index) => `Rule-${index + 1}\n${rule.trim()}`,
  );

  return `${RULES_PREAMBLE}\n\n${blocks.join("\n\n")}`;
}

/**
 * Validates the rule array coming from the editor. An empty array is allowed:
 * saving zero rules clears the repository's set.
 */
export function validateRuleInputs(rules: unknown): string[] {
  if (!Array.isArray(rules)) return ["Invalid rules."];

  if (rules.length > MAX_RULES) {
    return [`Add at most ${MAX_RULES} rules.`];
  }

  const errors: string[] = [];

  rules.forEach((rule, index) => {
    if (typeof rule !== "string" || !rule.trim()) {
      errors.push(`Rule-${index + 1} can't be empty.`);
      return;
    }

    if (rule.trim().length > MAX_RULE_LENGTH) {
      errors.push(
        `Rule-${index + 1} is too long (max ${MAX_RULE_LENGTH} characters).`,
      );
    }
  });

  return errors;
}
