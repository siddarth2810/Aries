import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { access, readFile, writeFile } from "node:fs/promises";
import { fetchDiff } from "../input/fetchDiff.js";
import { readLocalDiff } from "../input/readLocalDiff.js";
import { ensureAriesDirs, getAriesPaths } from "./paths.js";
import type { CachedDiff, CacheStore } from "./types.js";

export type ResolveCachedInputOptions = {
  offline?: boolean;
  noCache?: boolean;
};

function isHttpUrl(input: string) {
  return /^https?:\/\//.test(input);
}

function isSupportedDiffLikePath(input: string) {
  return input.endsWith(".diff") || input.endsWith(".patch");
}

function parseGitHubPullRequestUrl(input: string) {
  let url: URL;

  try {
    url = new URL(input);
  } catch {
    return null;
  }

  if (url.hostname !== "github.com") {
    return null;
  }

  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length !== 4 || parts[2] !== "pull") {
    return null;
  }

  const prPart = parts[3] ?? "";
  const match = prPart.match(/^(\d+)(?:\.diff)?$/);
  if (!match) {
    return null;
  }

  const owner = parts[0];
  const repo = parts[1];
  const pullNumber = match[1];

  if (!owner || !repo || !pullNumber) {
    return null;
  }

  return {
    cacheKey: `github:${owner}/${repo}#${pullNumber}`,
    diffUrl: `https://github.com/${owner}/${repo}/pull/${pullNumber}.diff`,
  };
}

function hashCacheKey(cacheKey: string) {
  return createHash("md5").update(cacheKey).digest("hex");
}

async function fileExists(filePath: string) {
  try {
    await access(filePath, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

async function readCacheStore(): Promise<CacheStore> {
  const { cacheJsonPath } = getAriesPaths();

  try {
    const raw = await readFile(cacheJsonPath, "utf8");
    return JSON.parse(raw) as CacheStore;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return {};
    }

    process.stderr.write(`aries: warning: ignoring invalid cache metadata at ${cacheJsonPath}\n`);
    return {};
  }
}

async function writeCacheStore(store: CacheStore) {
  const { cacheJsonPath } = await ensureAriesDirs();
  await writeFile(cacheJsonPath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

async function readCachedDiff(input: string, entry: CachedDiff | undefined) {
  if (!entry || !(await fileExists(entry.path))) {
    throw new Error(`No cached diff found for ${input}. Run without --offline once to fetch it.`);
  }

  return await readFile(entry.path, "utf8");
}

function getFetchErrorReason(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

async function fetchWithRevalidation(url: string, etag: string | undefined) {
  const headers: HeadersInit = {};
  if (etag) {
    headers["If-None-Match"] = etag;
  }

  let response: Response;

  try {
    response = await fetch(url, { headers });
  } catch (error) {
    throw new Error(getFetchErrorReason(error));
  }

  if (response.status === 304) {
    return { status: 304 as const };
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  return {
    status: 200 as const,
    diffText: await response.text(),
    etag: response.headers.get("etag") ?? undefined,
  };
}

async function fetchAndCacheDiff(input: string, cacheKey: string, url: string, cached: CachedDiff | undefined) {
  if (cached && !cached.etag && (await fileExists(cached.path))) {
    return await readFile(cached.path, "utf8");
  }

  let result: Awaited<ReturnType<typeof fetchWithRevalidation>>;

  try {
    result = await fetchWithRevalidation(url, cached?.etag);
  } catch (error) {
    throw new Error(`Failed to fetch diff from ${url}: ${getFetchErrorReason(error)}`);
  }

  if (result.status === 304) {
    return await readCachedDiff(input, cached);
  }

  const paths = await ensureAriesDirs();
  const diffPath = `${paths.diffsDir}/${hashCacheKey(cacheKey)}.diff`;
  await writeFile(diffPath, result.diffText, "utf8");

  const store = await readCacheStore();
  const entry: CachedDiff = {
    url,
    path: diffPath,
    fetchedAt: new Date().toISOString(),
    sizeBytes: Buffer.byteLength(result.diffText, "utf8"),
  };

  if (result.etag) {
    entry.etag = result.etag;
  }

  store[cacheKey] = entry;
  await writeCacheStore(store);

  return result.diffText;
}

export async function resolveCachedInput(
  input: string,
  options: ResolveCachedInputOptions = {},
): Promise<{
  sourceLabel: string;
  diffText: string;
}> {
  const githubPr = parseGitHubPullRequestUrl(input);

  if (githubPr) {
    if (options.noCache) {
      return {
        sourceLabel: input,
        diffText: await fetchDiff(githubPr.diffUrl),
      };
    }

    const store = await readCacheStore();
    const cached = store[githubPr.cacheKey];

    if (options.offline) {
      return {
        sourceLabel: input,
        diffText: await readCachedDiff(input, cached),
      };
    }

    return {
      sourceLabel: input,
      diffText: await fetchAndCacheDiff(input, githubPr.cacheKey, githubPr.diffUrl, cached),
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
