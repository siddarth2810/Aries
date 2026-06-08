export type DiffFileStatus = "added" | "deleted" | "modified" | "renamed";

export type ParsedDiff = {
  sourceLabel: string;
  files: DiffFile[];
  totalAdditions: number;
  totalDeletions: number;
};

export type DiffFile = {
  oldPath: string | null;
  newPath: string | null;
  displayPath: string;
  status: DiffFileStatus;
  additions: number;
  deletions: number;
  hunks: DiffHunk[];
};

export type DiffHunk = {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  header: string;
  lines: DiffLine[];
};

export type DiffLine = {
  type: "context" | "add" | "remove";
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
};
