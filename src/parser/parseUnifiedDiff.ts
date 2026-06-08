import type { DiffFile, DiffFileStatus, DiffHunk, ParsedDiff } from "./types.js";

const HUNK_HEADER_REGEX = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/;

function stripDiffPath(path: string) {
  if (path === "/dev/null") {
    return path;
  }

  return path.replace(/^[ab]\//, "");
}

function pathFromGitPart(part: string | undefined) {
  if (!part) {
    return null;
  }

  return stripDiffPath(part);
}

function inferStatus(oldPath: string | null, newPath: string | null): DiffFileStatus {
  if (oldPath === "/dev/null") {
    return "added";
  }

  if (newPath === "/dev/null") {
    return "deleted";
  }

  return "modified";
}

function displayPathFor(oldPath: string | null, newPath: string | null) {
  return newPath && newPath !== "/dev/null" ? newPath : oldPath ?? "(unknown)";
}

function finalizeFile(file: DiffFile) {
  file.status = inferStatus(file.oldPath, file.newPath);
  file.displayPath = displayPathFor(file.oldPath, file.newPath);
}

function parsePathMarker(line: string) {
  const markerValue = line.slice(4).trim();
  const [path] = markerValue.split(/\s+/);
  return stripDiffPath(path ?? markerValue);
}

export function parseUnifiedDiff(diffText: string, sourceLabel: string): ParsedDiff {
  if (diffText.trim().length === 0) {
    throw new Error("Empty diff");
  }

  const files: DiffFile[] = [];
  let currentFile: DiffFile | null = null;
  let currentHunk: DiffHunk | null = null;
  let oldLine = 0;
  let newLine = 0;

  function createFile(line: string): DiffFile {
    const parts = line.split(/\s+/);
    const oldPath = pathFromGitPart(parts[2]);
    const newPath = pathFromGitPart(parts[3]);

    return {
      oldPath,
      newPath,
      displayPath: displayPathFor(oldPath, newPath),
      status: inferStatus(oldPath, newPath),
      additions: 0,
      deletions: 0,
      hunks: [],
    };
  }

  for (const line of diffText.split(/\r?\n/)) {
    if (line.startsWith("diff --git ")) {
      if (currentFile) {
        finalizeFile(currentFile);
      }

      currentFile = createFile(line);
      currentHunk = null;
      files.push(currentFile);
      continue;
    }

    if (!currentFile) {
      continue;
    }

    if (line.startsWith("--- ")) {
      currentFile.oldPath = parsePathMarker(line);
      continue;
    }

    if (line.startsWith("+++ ")) {
      currentFile.newPath = parsePathMarker(line);
      continue;
    }

    if (line.startsWith("@@ ")) {
      const match = HUNK_HEADER_REGEX.exec(line);
      if (!match) {
        currentHunk = null;
        continue;
      }

      oldLine = Number(match[1]);
      newLine = Number(match[3]);
      currentHunk = {
        oldStart: oldLine,
        oldLines: Number(match[2] ?? "1"),
        newStart: newLine,
        newLines: Number(match[4] ?? "1"),
        header: line,
        lines: [],
      };
      currentFile.hunks.push(currentHunk);
      continue;
    }

    if (!currentHunk) {
      continue;
    }

    if (line.startsWith("\\ No newline at end of file")) {
      continue;
    }

    if (line.startsWith("+") && !line.startsWith("+++")) {
      currentHunk.lines.push({
        type: "add",
        content: line.slice(1),
        newLineNumber: newLine,
      });
      currentFile.additions += 1;
      newLine += 1;
      continue;
    }

    if (line.startsWith("-") && !line.startsWith("---")) {
      currentHunk.lines.push({
        type: "remove",
        content: line.slice(1),
        oldLineNumber: oldLine,
      });
      currentFile.deletions += 1;
      oldLine += 1;
      continue;
    }

    if (line.startsWith(" ")) {
      currentHunk.lines.push({
        type: "context",
        content: line.slice(1),
        oldLineNumber: oldLine,
        newLineNumber: newLine,
      });
      oldLine += 1;
      newLine += 1;
    }
  }

  if (currentFile) {
    finalizeFile(currentFile);
  }

  const changedFiles = files.filter((file) => file.hunks.length > 0);

  if (changedFiles.length === 0) {
    throw new Error("Diff has no changed files");
  }

  return {
    sourceLabel,
    files: changedFiles,
    totalAdditions: changedFiles.reduce((total, file) => total + file.additions, 0),
    totalDeletions: changedFiles.reduce((total, file) => total + file.deletions, 0),
  };
}
