# PatchDeck

Terminal-first viewer for local `.diff` / `.patch` files and GitHub pull request diffs.

## Usage

```bash
patchdeck file.diff
patchdeck file.patch
patchdeck https://github.com/org/repo/pull/123
patchdeck https://github.com/org/repo/pull/123.diff
```

## Development

```bash
bun install
bun run build
node dist/cli.js fixtures/simple.diff
```

PatchDeck uses OpenTUI. In this version of OpenTUI, the terminal runtime imports `bun:ffi`, so the Node entrypoint re-executes the built CLI under `bun` before starting the TUI.
