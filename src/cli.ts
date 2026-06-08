#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { PATCHDECK_USAGE, resolveInput } from "./input/resolveInput.js";
import { parseUnifiedDiff } from "./parser/parseUnifiedDiff.js";

function formatPatchDeckError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  if (message === "Unsupported input") {
    return `Unsupported input.\n\n${PATCHDECK_USAGE}\n`;
  }

  return `patchdeck: ${message}\n\n${PATCHDECK_USAGE}\n`;
}

async function main() {
  if (!process.versions.bun) {
    const child = spawnSync("bun", [fileURLToPath(import.meta.url), ...process.argv.slice(2)], {
      env: process.env,
      stdio: "inherit",
    });

    if (child.error) {
      throw new Error(`PatchDeck requires Bun for OpenTUI runtime: ${child.error.message}`);
    }

    process.exit(child.status ?? 1);
  }

  const args = process.argv.slice(2);

  if (args.length !== 1) {
    throw new Error("Unsupported input");
  }

  const { sourceLabel, diffText } = await resolveInput(args[0] ?? "");
  const diff = parseUnifiedDiff(diffText, sourceLabel);
  const { runPatchDeckApp } = await import("./tui/runPatchDeckApp.js");
  await runPatchDeckApp(diff);
}

await main().catch((error) => {
  process.stderr.write(formatPatchDeckError(error));
  process.exit(1);
});
