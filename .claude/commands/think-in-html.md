# /think-in-html

Generate an interactive HTML explainer from code, thinking transcripts, or text. The output is a single self-contained `.html` file that anyone can open in a browser — no server, no dependencies.

## Arguments

$ARGUMENTS — the target to analyze. Can be a file path, folder path, or a description of what to analyze. Optionally prefix with `--mode code|thinking|text` (defaults to `code`).

## Steps

1. **Determine mode.** Parse `$ARGUMENTS` for `--mode`. Default to `code` if not specified.

2. **Read the instructions.** Read these files from the project root (or from wherever `core/` lives):
   - `core/instructions/ANALYZE.md` — the universal analysis rules
   - `core/instructions/mode-{mode}.md` — mode-specific guidance

3. **Read the schema.** Read `core/schema/analysis.schema.json` to understand the exact output contract.

4. **Analyze the target.** Read the target file(s) specified in `$ARGUMENTS`. Follow the instructions from step 2 to produce an analysis.

5. **Emit analysis JSON.** Write the analysis as valid JSON to `analysis.json` in the project root. It MUST conform to the schema. Validate every required field before writing.

6. **Build the HTML.** Run:
   ```
   node core/build/inline.mjs analysis.json -o output.html
   ```

7. **Report.** Tell the user where the output file is and suggest they open it in a browser.

## Important

- The JSON must pass schema validation. If `inline.mjs` reports errors, fix the JSON and rebuild.
- Use `textContent`-safe strings — never include raw HTML in `plain` or `technical` fields.
- The `plain` field is teacher voice: explain like the reader has never seen code before.
- `technical` is optional — only include it when there's meaningful extra detail.
- Keep the walkthrough linear and narrated — each step should feel like "and then..."
- Quiz questions test understanding, not trivia. Always explain the answer.
