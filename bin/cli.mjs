#!/usr/bin/env node

// Think-In-HTML CLI
//   think-in-html build <analysis.json> [-o output.html]
//   think-in-html init                  wire the AI adapter into the current project
//   think-in-html instructions [mode]   print the analysis instructions + schema
//   think-in-html --help | --version
//
// Zero npm dependencies — Node stdlib only.

import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { inlineToFile } from '../core/build/inline.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = resolve(__dirname, '..');
const CORE = resolve(PKG_ROOT, 'core');

function version() {
  try {
    return JSON.parse(readFileSync(resolve(PKG_ROOT, 'package.json'), 'utf-8')).version;
  } catch { return '0.0.0'; }
}

const HELP = `Think-In-HTML — turn code, thinking, or text into one interactive HTML lesson

Usage:
  think-in-html build <analysis.json> [-o output.html]   Build a lesson from an analysis file
  think-in-html init                                      Wire the AI adapter into this project
  think-in-html instructions [code|thinking|text]        Print the analysis instructions + schema
  think-in-html --help                                    Show this help
  think-in-html --version                                 Show the version

Typical flow (run by your AI tool):
  1. think-in-html instructions code     # the AI reads how to analyze
  2. (AI writes analysis.json)
  3. think-in-html build analysis.json -o output.html
`;

// ── build ──
function cmdBuild(args) {
  if (!args.length) { console.error('Usage: think-in-html build <analysis.json> [-o output.html]'); process.exit(1); }
  const analysisPath = args[0];
  const oi = args.indexOf('-o');
  const outputPath = oi !== -1 ? args[oi + 1] : 'output.html';
  if (!outputPath) { console.error('Usage: think-in-html build <analysis.json> [-o output.html]'); process.exit(1); }
  try {
    const out = inlineToFile(analysisPath, outputPath);
    console.log(`Generated: ${out}`);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}

// ── instructions ──
function cmdInstructions(args) {
  const mode = (args[0] || 'code').toLowerCase();
  const modes = ['code', 'thinking', 'text'];
  if (modes.indexOf(mode) === -1) {
    console.error(`Unknown mode "${mode}". Use one of: ${modes.join(', ')}`);
    process.exit(1);
  }
  const analyze = readFileSync(resolve(CORE, 'instructions', 'ANALYZE.md'), 'utf-8');
  const modeDoc = readFileSync(resolve(CORE, 'instructions', `mode-${mode}.md`), 'utf-8');
  const schema = readFileSync(resolve(CORE, 'schema', 'analysis.schema.json'), 'utf-8');
  process.stdout.write(
    analyze + '\n\n---\n\n' + modeDoc +
    '\n\n---\n\n## Schema (core/schema/analysis.schema.json)\n\n```json\n' + schema + '\n```\n'
  );
}

// ── init ──
const CLAUDE_ADAPTER = `# /think-in-html

Generate an interactive HTML lesson from code, an AI thinking transcript, or text.

## Arguments
$ARGUMENTS — target file/folder to explain. Optional \`--mode code|thinking|text\` (default code).

## Steps
1. Run \`npx think-in-html instructions <mode>\` and follow the printed guidance exactly.
2. Analyze the target. Think like a teacher: pick a strategy, use a real-world analogy when it
   helps, and compose an ordered list of teaching blocks.
3. Write the result as valid JSON to \`analysis.json\` (schemaVersion 2).
4. Run \`npx think-in-html build analysis.json -o output.html\`.
5. Tell the user to open \`output.html\`, and that they can switch skins in the top-right.
`;

const CURSOR_ADAPTER = `---
description: Generate an interactive HTML lesson from code, thinking, or text. Use when asked to explain code visually or create an interactive walkthrough.
alwaysApply: false
---

# Think-In-HTML

When asked to generate an interactive HTML lesson:
1. Run \`npx think-in-html instructions code\` (or \`thinking\` / \`text\`) and follow it exactly.
2. Think like a teacher and compose teaching blocks; write valid JSON to \`analysis.json\`.
3. Run \`npx think-in-html build analysis.json -o output.html\`.
4. Tell the user where the output is.
`;

const CODEX_ADAPTER = `
### Think-In-HTML

When asked to generate an interactive HTML lesson:
1. Run \`npx think-in-html instructions code\` (or \`thinking\` / \`text\`) and follow it.
2. Compose teaching blocks and write valid JSON to \`analysis.json\`.
3. Run \`npx think-in-html build analysis.json -o output.html\`.
`;

function writeFileSafe(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, 'utf-8');
}

function cmdInit() {
  const cwd = process.cwd();
  let installed = false;
  console.log(`Wiring Think-In-HTML into: ${cwd}\n`);

  if (existsSync(join(cwd, '.claude'))) {
    writeFileSafe(join(cwd, '.claude', 'commands', 'think-in-html.md'), CLAUDE_ADAPTER);
    console.log('  ✓ Claude Code: .claude/commands/think-in-html.md');
    installed = true;
  }
  if (existsSync(join(cwd, '.cursor'))) {
    writeFileSafe(join(cwd, '.cursor', 'rules', 'think-in-html.mdc'), CURSOR_ADAPTER);
    console.log('  ✓ Cursor: .cursor/rules/think-in-html.mdc');
    installed = true;
  }
  if (existsSync(join(cwd, 'AGENTS.md'))) {
    appendFileSync(join(cwd, 'AGENTS.md'), CODEX_ADAPTER, 'utf-8');
    console.log('  ✓ Codex: appended to AGENTS.md');
    installed = true;
  }
  if (!installed) {
    writeFileSafe(join(cwd, '.claude', 'commands', 'think-in-html.md'), CLAUDE_ADAPTER);
    console.log('  ✓ Claude Code (default): .claude/commands/think-in-html.md');
    console.log('  (No tool detected — installed the Claude Code adapter by default)');
  }

  console.log('\nDone! Ask your AI tool to "use think-in-html to explain <file>".');
  console.log('The adapter runs `npx think-in-html` under the hood — no files copied into your repo.');
}

// ── router ──
const argv = process.argv.slice(2);
const cmd = argv[0];

if (!cmd || cmd === '--help' || cmd === '-h' || cmd === 'help') {
  process.stdout.write(HELP);
} else if (cmd === '--version' || cmd === '-v') {
  console.log(version());
} else if (cmd === 'build') {
  cmdBuild(argv.slice(1));
} else if (cmd === 'init') {
  cmdInit();
} else if (cmd === 'instructions') {
  cmdInstructions(argv.slice(1));
} else {
  console.error(`Unknown command: ${cmd}\n`);
  process.stdout.write(HELP);
  process.exit(1);
}
