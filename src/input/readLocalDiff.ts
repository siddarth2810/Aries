import { readFile } from "node:fs/promises";

export async function readLocalDiff(filePath: string) {
  try {
    return await readFile(filePath, "utf8");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to read local diff: ${message}`);
  }
}
