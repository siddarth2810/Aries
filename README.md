# Aries

Terminal-first viewer for local `.diff` / `.patch` files and GitHub pull request diffs.

## Usage

```bash
aries file.diff
aries file.patch
aries https://github.com/org/repo/pull/123
aries https://github.com/org/repo/pull/123.diff
```

## Development

```bash
bun install
bun run build
node dist/cli.js fixtures/simple.diff
```

Aries uses OpenTUI. In this version of OpenTUI, the terminal runtime imports `bun:ffi`, so the Node entrypoint re-executes the built CLI under `bun` before starting the TUI.
