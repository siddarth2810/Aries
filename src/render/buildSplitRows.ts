import type { DiffFile, DiffLine } from "../parser/types.js";
import type { SplitDiffRow } from "./types.js";

function flushChangeBlock(rows: SplitDiffRow[], removed: DiffLine[], added: DiffLine[]) {
  const rowCount = Math.max(removed.length, added.length);

  for (let index = 0; index < rowCount; index += 1) {
    const oldLine = removed[index];
    const newLine = added[index];

    rows.push({
      oldLineNumber: oldLine?.oldLineNumber,
      oldContent: oldLine?.content,
      oldType: oldLine ? "remove" : "empty",
      newLineNumber: newLine?.newLineNumber,
      newContent: newLine?.content,
      newType: newLine ? "add" : "empty",
    });
  }
}

export function buildSplitRows(file: DiffFile): SplitDiffRow[] {
  const rows: SplitDiffRow[] = [];

  for (const hunk of file.hunks) {
    rows.push({
      oldType: "hunk",
      oldContent: hunk.header,
      newType: "hunk",
      newContent: hunk.header,
    });

    let removed: DiffLine[] = [];
    let added: DiffLine[] = [];

    function flush() {
      if (removed.length === 0 && added.length === 0) {
        return;
      }

      flushChangeBlock(rows, removed, added);
      removed = [];
      added = [];
    }

    for (const line of hunk.lines) {
      if (line.type === "remove") {
        removed.push(line);
        continue;
      }

      if (line.type === "add") {
        added.push(line);
        continue;
      }

      flush();
      rows.push({
        oldLineNumber: line.oldLineNumber,
        oldContent: line.content,
        oldType: "context",
        newLineNumber: line.newLineNumber,
        newContent: line.content,
        newType: "context",
      });
    }

    flush();
  }

  return rows;
}
