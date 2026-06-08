import { fetchDiff } from "./fetchDiff.js";
import { readLocalDiff } from "./readLocalDiff.js";

export const ARIES_USAGE = `Usage:
  aries <file.diff | file.patch | github-pr-url | github-pr-diff-url>`;

function isHttpUrl(input: string) {
  return /^https?:\/\//.test(input);
}

function isSupportedDiffLikePath(input: string) {
  return input.endsWith(".diff") || input.endsWith(".patch");
}

function normalizeUrl(input: string) {
  try {
    return new URL(input);
  } catch {
    return null;
  }
}

function isGitHubPullRequestUrl(input: string) {
  const url = normalizeUrl(input);

  if (!url || url.hostname !== "github.com") {
    return false;
  }

  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length !== 4 || parts[2] !== "pull") {
    return false;
  }

  const prPart = parts[3] ?? "";
  return /^\d+(?:\.diff)?$/.test(prPart);
}

export async function resolveInput(input: string): Promise<{
  sourceLabel: string;
  diffText: string;
}> {
  if (isGitHubPullRequestUrl(input)) {
    const diffUrl = input.endsWith(".diff") ? input : `${input}.diff`;
    return {
      sourceLabel: diffUrl,
      diffText: await fetchDiff(diffUrl),
    };
  }

  if (isHttpUrl(input)) {
    if (!isSupportedDiffLikePath(input)) {
      throw new Error("Only .diff or .patch URLs are supported for v0.1");
    }

    return {
      sourceLabel: input,
      diffText: await fetchDiff(input),
    };
  }

  if (isSupportedDiffLikePath(input)) {
    return {
      sourceLabel: input,
      diffText: await readLocalDiff(input),
    };
  }

  throw new Error("Unsupported input");
}
