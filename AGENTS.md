# Aries Agent Notes

## Project Scope

Aries is a standalone TypeScript/Bun project created from the Aries v0.1 design doc. It uses Hunk as a reference for OpenTUI patterns, but the code in this folder should stay independent from `../hunk`.

The v0.1 goal is intentionally small:

- Load exactly one local `.diff` / `.patch` file or supported GitHub pull request diff URL.
- Parse unified diff text into a simple internal model.
- Render the first changed file in a three-pane OpenTUI layout.
- Support only `q` / Escape to quit.

Do not add review workflows, comments, GitHub API authentication, search, mouse support, AI summaries, config files, themes, or patch application in v0.1.

## Commands

Run commands from this directory:

```bash
bun install
bun run build
bun run typecheck
node dist/cli.js fixtures/simple.diff
```

OpenTUI currently imports `bun:ffi`, so the Node CLI wrapper re-executes the built CLI under `bun` before loading the TUI.

## Package-Local Skills
React composition and component API design: web/.agents/skills/vercel-composition-patterns/SKILL.md
React/Next.js performance and rendering best practices: web/.agents/skills/vercel-react-best-practices/SKILL.md
Read these package-local skills before substantial frontend refactors when the task involves component composition, reusable component APIs, rendering performance, virtualized lists, local feature stores, bundle size, React/Next.js performance patterns, or browser-based signoff of user-visible changes.

## Source Layout

- `src/cli.ts`: CLI entrypoint, argument count validation, Node-to-Bun runtime handoff, input resolution, parsing, and TUI startup.
- `src/input/resolveInput.ts`: input classification for local `.diff` / `.patch`, GitHub PR URLs, and remote `.diff` / `.patch` URLs.
- `src/input/fetchDiff.ts`: remote diff fetch using native `fetch`.
- `src/input/readLocalDiff.ts`: local diff file loading via `fs/promises`.
- `src/parser/types.ts`: parsed diff data types.
- `src/parser/parseUnifiedDiff.ts`: minimal GitHub-style unified diff parser.
- `src/render/types.ts`: split diff row type used by the TUI.
- `src/render/buildSplitRows.ts`: side-by-side old/new row alignment.
- `src/tui/App.tsx`: top-level OpenTUI layout.
- `src/tui/components/`: header, file list, split diff view, and status bar.
- `src/tui/runAriesApp.ts`: OpenTUI renderer lifecycle.
- `src/tui/text.ts`: local fixed-width truncation/padding helpers.
- `fixtures/simple.diff` and `fixtures/simple.patch`: local smoke-test fixtures.

