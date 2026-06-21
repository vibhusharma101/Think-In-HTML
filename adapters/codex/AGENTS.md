# Think-In-HTML — Codex Agent

When asked to generate an interactive HTML explainer:

1. Read `core/instructions/ANALYZE.md` and the relevant `core/instructions/mode-*.md`.
2. Analyze the target input following those instructions.
3. Output the analysis as a JSON object conforming to `core/schema/analysis.schema.json`.
4. Save the JSON to `analysis.json`.
5. Run `node core/build/inline.mjs analysis.json -o output.html` to produce the final file.
