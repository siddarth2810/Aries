import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { createElement } from "react";
import type { ParsedDiff } from "../parser/types.js";
import { App } from "./App.js";

export async function runAriesApp(diff: ParsedDiff) {
  const renderer = await createCliRenderer({
    stdin: process.stdin,
    stdout: process.stdout,
    useMouse: false,
    screenMode: "alternate-screen",
    exitOnCtrlC: true,
    openConsoleOnError: true,
  });
  const root = createRoot(renderer);
  let shuttingDown = false;

  function shutdown() {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    process.off("SIGINT", shutdown);
    process.off("SIGTERM", shutdown);
    root.unmount();
    renderer.destroy();
    process.exit(0);
  }

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
  root.render(createElement(App, { diff, onQuit: shutdown }));
}
