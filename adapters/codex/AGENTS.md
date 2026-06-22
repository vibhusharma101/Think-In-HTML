# Codex Adapter

This is the reference copy of the Codex agent instructions.

## How it works

Codex reads `AGENTS.md` in your project root. The Think-In-HTML instructions tell the agent how to analyze code and produce interactive explainers.

## Installation

Recommended — append the adapter automatically (run in a project that has an `AGENTS.md`):

```bash
npx think-in-html init
```

This appends the section below. To do it by hand, add this to your `AGENTS.md`:

---

### Think-In-HTML

When asked to generate an interactive HTML lesson:

1. Run `npx think-in-html instructions code` (or `thinking` / `text`) and follow it — it prints
   the analysis guide and the schema.
2. Think like a teacher and compose teaching blocks; write valid JSON to `analysis.json`.
3. Run `npx think-in-html build analysis.json -o output.html`.

Rules:
- Teacher voice — explain like the reader has never seen the code before
- `technical` fields are optional
- Never include raw HTML in text fields
- Quiz questions test understanding, not trivia

## Usage

In Codex, ask:
- "Run think-in-html on src/auth/"
- "Generate an interactive explainer for this module"
