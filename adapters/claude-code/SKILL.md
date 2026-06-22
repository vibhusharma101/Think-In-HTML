# Claude Code Adapter

This is the reference copy of the Claude Code skill. The **working version** lives at `.claude/commands/think-in-html.md`.

## How it works

Claude Code loads skills from `.claude/commands/` in your project root. When a user types `/think-in-html`, Claude Code reads the skill file and follows its instructions.

## Installation

Recommended — wire the adapter automatically:

```bash
npx think-in-html init
```

This writes `.claude/commands/think-in-html.md` pointing at the `npx think-in-html` CLI
(`instructions` to read the analysis guide, `build` to produce the HTML). Nothing is copied
into your repo.

## Usage

```
/think-in-html path/to/file.js
/think-in-html src/auth/ --mode code
/think-in-html thinking-log.txt --mode thinking
```
