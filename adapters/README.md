# Adding Think-In-HTML to any AI coding tool

Think-In-HTML works with any AI tool that can read files and run shell commands. Each adapter is a thin config file that tells the tool *how* to use the core engine.

## 3-step integration

1. **Point the tool at the instructions.** Have it read `core/instructions/ANALYZE.md` plus the relevant mode file (`mode-code.md`, `mode-thinking.md`, or `mode-text.md`).

2. **Have it analyze the target.** The tool reads the input and outputs a JSON object conforming to `core/schema/analysis.schema.json`. Save it as `analysis.json`.

3. **Build the HTML.** Run:
   ```
   node core/build/inline.mjs analysis.json -o output.html
   ```
   Or have the agent inline the JSON into `core/template/shell.html` directly (replace `{{ANALYSIS_JSON}}`, `{{STYLES}}`, `{{APP_JS}}` with the contents of the template files).

## Existing adapters

| Tool | File | How to use |
|------|------|------------|
| Claude Code | `claude-code/SKILL.md` | Install as a skill in `.claude/commands/` |
| Cursor | `cursor/think-in-html.mdc` | Add to `.cursor/rules/` |
| Codex | `codex/AGENTS.md` | Add to your project's `AGENTS.md` |

## Writing a new adapter

Copy any existing adapter and adjust the tool-specific format. The core logic (what to analyze, how to output JSON, how to build) stays the same — only the "how to tell *this* tool to do it" wrapper changes.
