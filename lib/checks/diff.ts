export type DiffFile = {
  filename: string;
  status?: string;
  patch?: string | null;
};

const MAX_FILE_PATCH_LENGTH = 12_000;

function renderFile(file: DiffFile): string {
  const header = `--- ${file.filename} (${file.status ?? "modified"})`;
  const patch = file.patch?.trim();

  if (!patch) return `${header}\n[No text diff available.]`;

  const clipped =
    patch.length > MAX_FILE_PATCH_LENGTH
      ? `${patch.slice(0, MAX_FILE_PATCH_LENGTH)}\n[Patch truncated.]`
      : patch;

  return `${header}\n${clipped}`;
}

/**
 * Builds a compact, prompt-ready diff. Keeping one limit for the whole diff
 * prevents one generated file from crowding out every other change.
 */
export function renderFilesDiff(
  files: DiffFile[],
  maxLength = 80_000,
): { text: string; truncated: boolean } {
  const sections: string[] = [];
  let length = 0;
  let truncated = false;

  for (const file of files) {
    const section = renderFile(file);

    if (length + section.length > maxLength) {
      const remaining = maxLength - length;
      if (remaining > 200) {
        sections.push(`${section.slice(0, remaining)}\n[Diff truncated.]`);
      }
      truncated = true;
      break;
    }

    sections.push(section);
    length += section.length;
  }

  return { text: sections.join("\n\n"), truncated };
}

/**
 * Collects the new-file line ranges covered by each patch. Check-run
 * annotations must point at a line that exists in the diff.
 */
export function collectChangedLineRanges(
  files: DiffFile[],
): Map<string, Array<[number, number]>> {
  const ranges = new Map<string, Array<[number, number]>>();
  const hunk = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/;

  for (const file of files) {
    if (!file.patch) continue;

    const fileRanges: Array<[number, number]> = [];

    for (const line of file.patch.split("\n")) {
      const match = line.match(hunk);
      if (!match) continue;

      const start = Number(match[1]);
      const count = match[2] === undefined ? 1 : Number(match[2]);
      if (!Number.isInteger(start) || !Number.isInteger(count) || count <= 0) {
        continue;
      }

      fileRanges.push([start, start + count - 1]);
    }

    if (fileRanges.length > 0) ranges.set(file.filename, fileRanges);
  }

  return ranges;
}

export function isLineInDiff(
  ranges: Map<string, Array<[number, number]>>,
  file: string,
  line: number,
): boolean {
  return (ranges.get(file) ?? []).some(
    ([start, end]) => line >= start && line <= end,
  );
}
