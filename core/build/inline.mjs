#!/usr/bin/env node

// Think-In-HTML inliner — combines shell + styles + app.js + analysis.json into one .html
// Zero npm dependencies. Uses only Node stdlib.

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = resolve(__dirname, '..', 'template');

function usage() {
  console.error('Usage: node inline.mjs <analysis.json> [-o output.html]');
  process.exit(1);
}

function escapeForScript(str) {
  // Any </script or </style inside a <script> or <style> block will cause
  // the HTML parser to close the block early. Break the sequence so the
  // browser never sees a premature closing tag.
  return str.replace(/<\/(script|style)/gi, '<\\/$1');
}

function validateAnalysis(analysis) {
  const required = ['schemaVersion', 'meta', 'blocks'];
  const missing = required.filter(k => !(k in analysis));
  if (missing.length > 0) {
    console.error(`Schema validation failed. Missing required fields: ${missing.join(', ')}`);
    console.error('See core/schema/analysis.schema.json for the full schema.');
    console.error('Minimal example: core/instructions/ANALYZE.md');
    process.exit(1);
  }
  if (analysis.schemaVersion !== 2) {
    console.error(`Unsupported schemaVersion: ${analysis.schemaVersion}. Expected: 2`);
    process.exit(1);
  }
  if (!Array.isArray(analysis.blocks) || analysis.blocks.length === 0) {
    console.error('Schema validation failed: "blocks" must be a non-empty array.');
    process.exit(1);
  }
  const known = ['hook', 'analogy', 'concept', 'code', 'steps', 'flow', 'architecture', 'compare', 'aha', 'quiz', 'recap', 'glossary'];
  analysis.blocks.forEach((b, i) => {
    if (!b || typeof b.type !== 'string') {
      console.error(`Schema validation failed: blocks[${i}] is missing a "type".`);
      process.exit(1);
    }
    if (known.indexOf(b.type) === -1) {
      console.error(`Schema validation failed: blocks[${i}].type "${b.type}" is not a known block. Known: ${known.join(', ')}`);
      process.exit(1);
    }
  });
}

const args = process.argv.slice(2);
if (args.length === 0) usage();

const analysisPath = args[0];
const outputIdx = args.indexOf('-o');
const outputPath = outputIdx !== -1 ? args[outputIdx + 1] : 'output.html';

if (!outputPath) usage();

const analysisRaw = readFileSync(resolve(analysisPath), 'utf-8');
const analysis = JSON.parse(analysisRaw);
validateAnalysis(analysis);

const shell = readFileSync(resolve(TEMPLATE_DIR, 'shell.html'), 'utf-8');
const styles = readFileSync(resolve(TEMPLATE_DIR, 'styles.css'), 'utf-8');
const appJs = readFileSync(resolve(TEMPLATE_DIR, 'app.js'), 'utf-8');

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
const html = shell
  .replace('{{STYLES}}', () => safeStyles)
  .replace('{{APP_JS}}', () => safeAppJs)
  .replace('{{ANALYSIS_JSON}}', () => safeJson);

writeFileSync(resolve(outputPath), html, 'utf-8');
console.log(`Generated: ${outputPath}`);
