import { mkdir } from "node:fs/promises";
import envPaths from "env-paths";

export type AriesPaths = {
  cacheDir: string;
  dataDir: string;
  diffsDir: string;
  cacheJsonPath: string;
};

export function getAriesPaths(): AriesPaths {
  const paths = envPaths("aries", { suffix: "" });
  const cacheDir = process.env.ARIES_CACHE_DIR || paths.cache;
  const dataDir = process.env.ARIES_DATA_DIR || paths.data;

  return {
    cacheDir,
    dataDir,
    diffsDir: `${cacheDir}/diffs`,
    cacheJsonPath: `${cacheDir}/cache.json`,
  };
}

export async function ensureAriesDirs(): Promise<AriesPaths> {
  const paths = getAriesPaths();
  await mkdir(paths.cacheDir, { recursive: true });
  await mkdir(paths.diffsDir, { recursive: true });
  return paths;
}
