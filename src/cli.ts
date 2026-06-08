#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { ARIES_USAGE, resolveInput } from "./input/resolveInput.js";
import { parseUnifiedDiff } from "./parser/parseUnifiedDiff.js";

function formatAriesError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  if (message === "Unsupported input") {
    return `Unsupported input.\n\n${ARIES_USAGE}\n`;
  }

  return `aries: ${message}\n\n${ARIES_USAGE}\n`;
}

async function main() {
  if (!process.versions.bun) {
    const child = spawnSync("bun", [fileURLToPath(import.meta.url), ...process.argv.slice(2)], {
      env: process.env,
      stdio: "inherit",
    });

    if (child.error) {
      throw new Error(`Aries requires Bun for OpenTUI runtime: ${child.error.message}`);
    }

    process.exit(child.status ?? 1);
  }

  const args = process.argv.slice(2);
  const offline = args[0] === "--offline";
  const input = offline ? args[1] : args[0];

  if ((offline && args.length !== 2) || (!offline && args.length !== 1) || !input) {
    throw new Error("Unsupported input");
  }

  const { sourceLabel, diffText } = await resolveInput(input, { offline });
  const diff = parseUnifiedDiff(diffText, sourceLabel);
  const { runAriesApp } = await import("./tui/runAriesApp.js");
  await runAriesApp(diff);
}

await main().catch((error) => {
  process.stderr.write(formatAriesError(error));
  process.exit(1);
});
