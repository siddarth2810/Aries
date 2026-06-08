import { readFile } from "node:fs/promises";

export async function readLocalDiff(filePath: string) {
  try {
    return await readFile(filePath, "utf8");
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      throw new Error(`Failed to read local diff from ${filePath}: file not found`);
    }

    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to read local diff from ${filePath}: ${message}`);
  }
}
