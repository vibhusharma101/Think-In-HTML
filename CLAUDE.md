# Think-In-HTML

A tool-agnostic engine that turns code, AI thinking transcripts, or text into self-contained interactive HTML explainers.

## Architecture

```
target input → AI reads core/instructions/ → analysis.json (schema-validated) → HTML shell renders it → one output.html
```

- `core/template/` — the HTML+CSS+JS renderer (shell.html, app.js, styles.css)
- `core/schema/analysis.schema.json` — the contract between LLM output and the renderer
- `core/instructions/` — portable instructions any AI tool reads to produce analysis JSON
- `core/build/inline.mjs` — zero-dep Node script that inlines everything into one .html
- `adapters/` — thin per-tool configs (Claude Code, Cursor, Codex, etc.)

## Commands

- `/think-in-html <target>` — generate an interactive HTML explainer for the given file/folder

## Build

No dependencies to install. To build an output from an existing analysis.json:

```
node core/build/inline.mjs analysis.json -o output.html
```

## Key rules

- The LLM only emits structured JSON, never raw HTML. The tested shell renders it.
- All content injected into the DOM must be escaped (textContent, not innerHTML with raw data).
- The `plain` field uses teacher voice — no jargon without a glossary entry.
- `technical` fields are optional — they fall back to `plain` when absent.
- Output must be a single self-contained .html with no external dependencies.
