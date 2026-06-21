# Codex Adapter

This is the reference copy of the Codex agent instructions.

## How it works

Codex reads `AGENTS.md` in your project root. The Think-In-HTML instructions tell the agent how to analyze code and produce interactive explainers.

## Manual installation (if not using install.sh)

1. Copy the `core/` folder into your project (e.g., as `think-in-html/core/`)
2. Append the following to your project's `AGENTS.md`:

---

### Think-In-HTML

When asked to generate an interactive HTML explainer:

1. Read `think-in-html/core/instructions/ANALYZE.md` and the relevant `think-in-html/core/instructions/mode-*.md`.
2. Read `think-in-html/core/schema/analysis.schema.json` to understand the output contract.
3. Analyze the target input following those instructions.
4. Output the analysis as a JSON object conforming to the schema. Save it as `analysis.json`.
5. Run `node think-in-html/core/build/inline.mjs analysis.json -o output.html` to produce the final file.

Rules:
- `plain` fields use teacher voice — explain like the reader has never seen code before
- `technical` fields are optional
- Never include raw HTML in text fields
- Quiz questions test understanding, not trivia

## Usage

In Codex, ask:
- "Run think-in-html on src/auth/"
- "Generate an interactive explainer for this module"
