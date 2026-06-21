# Claude Code Adapter

This is the reference copy of the Claude Code skill. The **working version** lives at `.claude/commands/think-in-html.md`.

## How it works

Claude Code loads skills from `.claude/commands/` in your project root. When a user types `/think-in-html`, Claude Code reads the skill file and follows its instructions.

## Manual installation (if not using install.sh)

1. Copy the `core/` folder into your project (e.g., as `think-in-html/core/`)
2. Copy `.claude/commands/think-in-html.md` into your project's `.claude/commands/`
3. Update paths inside the skill file if you placed `core/` in a subdirectory

## Usage

```
/think-in-html path/to/file.js
/think-in-html src/auth/ --mode code
/think-in-html thinking-log.txt --mode thinking
```
