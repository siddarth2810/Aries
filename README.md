# Aries

Terminal-first viewer for local `.diff` / `.patch` files and GitHub pull request diffs.

## Install

```bash
npm install -g aries-diff
```

You can also run it without a global install:

```bash
npx aries-diff fixtures/simple.diff
```

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

Aries uses OpenTUI. In this version of OpenTUI, the terminal runtime imports `bun:ffi`, so the Node entrypoint re-executes the built CLI under `bun` before starting the TUI. Bun is required at runtime even when you launch Aries through `node` or `npx`.
