# /think-in-html

Generate an interactive HTML explainer from code, thinking transcripts, or text.

## Usage

```
/think-in-html <target> [--mode code|thinking|text]
```

## Instructions

1. Read `core/instructions/ANALYZE.md` and the relevant `core/instructions/mode-*.md`.
2. Analyze the target input following those instructions.
3. Output the analysis as a JSON object conforming to `core/schema/analysis.schema.json`.
4. Save the JSON to `analysis.json`.
5. Run `node core/build/inline.mjs analysis.json -o output.html` to produce the final file.
6. Report the output path to the user.
