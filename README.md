
# Aries

Terminal-first viewer for local `.diff` / `.patch` files and GitHub pull request diffs.

<img width="1907" height="966" alt="screenshot-20260610-191451Z-selected" src="https://github.com/user-attachments/assets/5cf102e9-3665-4641-b9ee-4e9b0c80607f" />
<img width="1908" height="968" alt="screenshot-20260610-191509Z-selected" src="https://github.com/user-attachments/assets/8c69291c-72d2-4df8-9260-f956f469ad27" />

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
