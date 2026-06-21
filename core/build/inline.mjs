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

function escapeForInline(str) {
  return str;
}

function validateAnalysis(analysis) {
  const required = ['schemaVersion', 'meta', 'summary', 'nodes', 'edges', 'walkthrough', 'diagram'];
  const missing = required.filter(k => !(k in analysis));
  if (missing.length > 0) {
    console.error(`Schema validation failed. Missing required fields: ${missing.join(', ')}`);
    console.error('See core/schema/analysis.schema.json for the full schema.');
    console.error('Minimal example: core/instructions/ANALYZE.md');
    process.exit(1);
  }
  if (analysis.schemaVersion !== 1) {
    console.error(`Unsupported schemaVersion: ${analysis.schemaVersion}. Expected: 1`);
    process.exit(1);
  }
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

const html = shell
  .replace('{{STYLES}}', escapeForInline(styles))
  .replace('{{ANALYSIS_JSON}}', JSON.stringify(analysis))
  .replace('{{APP_JS}}', escapeForInline(appJs));

writeFileSync(resolve(outputPath), html, 'utf-8');
console.log(`Generated: ${outputPath}`);
