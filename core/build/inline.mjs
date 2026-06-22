#!/usr/bin/env node

// Think-In-HTML inliner — combines shell + styles + app.js + analysis.json into one .html
// Zero npm dependencies. Uses only Node stdlib.
//
// Usable two ways:
//   - standalone CLI:  node core/build/inline.mjs <analysis.json> [-o output.html]
//   - imported module: import { buildHtml, inlineToFile } from './inline.mjs'

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = resolve(__dirname, '..', 'template');

export const KNOWN_BLOCKS = [
  'hook', 'analogy', 'concept', 'code', 'steps', 'flow',
  'architecture', 'compare', 'aha', 'quiz', 'recap', 'glossary'
];

function escapeForScript(str) {
  // Any </script or </style inside a <script> or <style> block will cause
  // the HTML parser to close the block early. Break the sequence so the
  // browser never sees a premature closing tag.
  return str.replace(/<\/(script|style)/gi, '<\\/$1');
}

// Throws an Error (with a clear message) when the analysis is invalid. Callers
// decide how to surface it — the CLI prints the message and exits non-zero.
export function validateAnalysis(analysis) {
  const required = ['schemaVersion', 'meta', 'blocks'];
  const missing = required.filter(k => !(k in analysis));
  if (missing.length > 0) {
    throw new Error(
      `Schema validation failed. Missing required fields: ${missing.join(', ')}\n` +
      'See core/schema/analysis.schema.json for the full schema.'
    );
  }
  if (analysis.schemaVersion !== 2) {
    throw new Error(`Unsupported schemaVersion: ${analysis.schemaVersion}. Expected: 2`);
  }
  if (!Array.isArray(analysis.blocks) || analysis.blocks.length === 0) {
    throw new Error('Schema validation failed: "blocks" must be a non-empty array.');
  }
  analysis.blocks.forEach((b, i) => {
    if (!b || typeof b.type !== 'string') {
      throw new Error(`Schema validation failed: blocks[${i}] is missing a "type".`);
    }
    if (KNOWN_BLOCKS.indexOf(b.type) === -1) {
      throw new Error(
        `Schema validation failed: blocks[${i}].type "${b.type}" is not a known block. ` +
        `Known: ${KNOWN_BLOCKS.join(', ')}`
      );
    }
  });
}

// Build the self-contained HTML string from a parsed analysis object.
export function buildHtml(analysis, templateDir = TEMPLATE_DIR) {
  validateAnalysis(analysis);

  const shell = readFileSync(resolve(templateDir, 'shell.html'), 'utf-8');
  const styles = readFileSync(resolve(templateDir, 'styles.css'), 'utf-8');
  const appJs = readFileSync(resolve(templateDir, 'app.js'), 'utf-8');

  // 1. Escape </script> and </style> inside JSON so the HTML parser doesn't
  //    close the <script> block early.
  // 2. Escape placeholder tokens so subsequent .replace() calls don't collide.
  const safeJson = JSON.stringify(analysis)
    .replace(/<\/(script|style)/gi, '<\\/$1')
    .replace(/\{\{STYLES\}\}/g, '{{S\\u0054YLES}}')
    .replace(/\{\{APP_JS\}\}/g, '{{A\\u0050P_JS}}')
    .replace(/\{\{ANALYSIS_JSON\}\}/g, '{{A\\u004ENALYSIS_JSON}}');

  // Use function replacements so `$` sequences ($&, $1, $`, etc.) inside the
  // CSS / JS / JSON are inserted literally and never interpreted by String.replace.
  const safeStyles = escapeForScript(styles);
  const safeAppJs = escapeForScript(appJs);
  return shell
    .replace('{{STYLES}}', () => safeStyles)
    .replace('{{APP_JS}}', () => safeAppJs)
    .replace('{{ANALYSIS_JSON}}', () => safeJson);
}

// Read an analysis JSON file, build the HTML, and write it. Returns the output path.
export function inlineToFile(analysisPath, outputPath = 'output.html', templateDir = TEMPLATE_DIR) {
  const analysis = JSON.parse(readFileSync(resolve(analysisPath), 'utf-8'));
  const html = buildHtml(analysis, templateDir);
  writeFileSync(resolve(outputPath), html, 'utf-8');
  return resolve(outputPath);
}

// ── Standalone CLI (only when run directly, not when imported) ──
function isMain() {
  return process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
}

if (isMain()) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node inline.mjs <analysis.json> [-o output.html]');
    process.exit(1);
  }
  const analysisPath = args[0];
  const outputIdx = args.indexOf('-o');
  const outputPath = outputIdx !== -1 ? args[outputIdx + 1] : 'output.html';
  if (!outputPath) {
    console.error('Usage: node inline.mjs <analysis.json> [-o output.html]');
    process.exit(1);
  }
  try {
    const out = inlineToFile(analysisPath, outputPath);
    console.log(`Generated: ${out}`);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
