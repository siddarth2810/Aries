import { resolveCachedInput, type ResolveCachedInputOptions } from "../persistence/cache.js";

export const ARIES_USAGE = `Usage:
  aries [--offline] <file.diff | file.patch | github-pr-url | github-pr-diff-url>`;

export async function resolveInput(input: string): Promise<{
  sourceLabel: string;
  diffText: string;
}>;
export async function resolveInput(
  input: string,
  options: ResolveCachedInputOptions,
): Promise<{
  sourceLabel: string;
  diffText: string;
}>;
export async function resolveInput(input: string, options?: ResolveCachedInputOptions) {
  return await resolveCachedInput(input, options);
}
