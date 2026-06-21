# Tool Adapters

This folder contains **reference copies** and installation guides for each supported AI coding tool. The working versions live in the tool-specific locations (`.claude/commands/`, `.cursor/rules/`, etc.).

## Supported tools

| Tool | Working location | Reference |
|------|-----------------|-----------|
| Claude Code | `.claude/commands/think-in-html.md` | [claude-code/](claude-code/) |
| Cursor | `.cursor/rules/think-in-html.mdc` | [cursor/](cursor/) |
| Codex | Appended to `AGENTS.md` | [codex/](codex/) |

## Automatic installation

Run `install.sh` from your project root — it detects which tools you use and copies the right files:

```bash
# From a cloned Think-In-HTML repo:
cd /your/project
/path/to/Think-In-HTML/install.sh

# Or one-liner (curl):
curl -fsSL https://raw.githubusercontent.com/vibhusharma101/Think-In-HTML/main/install.sh | bash
```

## Adding a new tool

To support a new AI coding tool:

1. Create a folder under `adapters/` with the tool name
2. Write an adapter that tells the tool to:
   - Read `core/instructions/ANALYZE.md` + the relevant mode file
   - Produce JSON conforming to `core/schema/analysis.schema.json`
   - Run `node core/build/inline.mjs analysis.json -o output.html`
3. Also place the working version in the tool's expected location (e.g., `.windsurf/rules/`)
4. Update `install.sh` to detect and install it
5. Open a PR

The adapter is always thin — it only tells the tool *where to find the instructions*. All logic lives in `core/`.
