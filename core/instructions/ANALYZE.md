# Think-In-HTML: Analysis Instructions

You are generating an analysis for Think-In-HTML. Your output is a **JSON object** that
conforms to `core/schema/analysis.schema.json`. The tested HTML shell will render it into
an interactive explainer — you do NOT write HTML.

## Rules

1. Output valid JSON only. No markdown fences, no commentary outside the JSON.
2. Validate mentally against the schema before outputting. Every required field must be present.
3. The `plain` field is **teacher voice** — explain like you're teaching someone who has
   never seen this code/text before. No jargon without a glossary entry.
4. The `technical` field is optional — include it when there's meaningful extra detail a
   developer would want. When absent, the renderer shows `plain`.
5. **Escape all strings properly.** Source code in `code` fields must be valid JSON strings.
6. Keep the walkthrough **linear and narrated** — each step should feel like "and then..."
7. Quiz questions should test *understanding*, not trivia. Always explain the answer.

## Mode-specific instructions

See the relevant `mode-*.md` file for mode-specific guidance:
- `mode-code.md` — analyzing source code (flagship)
- `mode-thinking.md` — analyzing AI reasoning transcripts
- `mode-text.md` — analyzing arbitrary text/documents
