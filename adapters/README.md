# Tool Adapters

This folder contains **reference copies** and installation guides for each supported AI coding tool. The working versions live in the tool-specific locations (`.claude/commands/`, `.cursor/rules/`, etc.).

## Supported tools

| Tool | Working location | Reference |
|------|-----------------|-----------|
| Claude Code | `.claude/commands/think-in-html.md` | [claude-code/](claude-code/) |
| Cursor | `.cursor/rules/think-in-html.mdc` | [cursor/](cursor/) |
| Codex | Appended to `AGENTS.md` | [codex/](codex/) |

## Automatic installation

The recommended way (requires Node.js ≥ 18) auto-detects your tools and writes the adapter:

```bash
npx think-in-html init
```

No Node? The curl one-liner copies the engine + adapter into your project instead:

```bash
curl -fsSL https://raw.githubusercontent.com/vibhusharma101/Think-In-HTML/main/install.sh | bash
```

## Adding a new tool

To support a new AI coding tool:

1. Create a folder under `adapters/` with the tool name
2. Write an adapter that tells the tool to:
   - Run `npx think-in-html instructions <mode>` and follow it (it prints the analysis guide + schema)
   - Produce JSON conforming to that schema and write it to `analysis.json`
   - Run `npx think-in-html build analysis.json -o output.html`
3. Add detection for the tool to the `init` command in `bin/cli.mjs`
4. Open a PR

The adapter is always thin — it only tells the tool *which CLI commands to run*. All logic lives in `core/`.

The adapter is always thin — it only tells the tool *where to find the instructions*. All logic lives in `core/`.
