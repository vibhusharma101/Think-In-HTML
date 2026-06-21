#!/usr/bin/env bash
set -euo pipefail

# Think-In-HTML installer
# Copies the core engine + tool adapter into your project.
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/vibhusharma101/Think-In-HTML/main/install.sh | bash
#   OR
#   git clone https://github.com/vibhusharma101/Think-In-HTML.git /tmp/think-in-html && /tmp/think-in-html/install.sh
#
# Run from your project root (the directory where you want Think-In-HTML installed).

REPO_URL="https://github.com/vibhusharma101/Think-In-HTML"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# If running from a cloned repo, use local files. Otherwise, clone to temp.
if [ -f "$SCRIPT_DIR/core/schema/analysis.schema.json" ]; then
  SOURCE_DIR="$SCRIPT_DIR"
else
  echo "Cloning Think-In-HTML..."
  SOURCE_DIR=$(mktemp -d)
  git clone --depth 1 "$REPO_URL.git" "$SOURCE_DIR" 2>/dev/null
  trap "rm -rf '$SOURCE_DIR'" EXIT
fi

PROJECT_DIR="$(pwd)"

echo ""
echo "Installing Think-In-HTML into: $PROJECT_DIR"
echo ""

# 1. Copy core engine
echo "[1/3] Copying core engine..."
mkdir -p "$PROJECT_DIR/think-in-html"
cp -r "$SOURCE_DIR/core" "$PROJECT_DIR/think-in-html/core"

# 2. Detect tools and install adapters
echo "[2/3] Installing tool adapters..."

installed_any=false

# Claude Code
if [ -d "$PROJECT_DIR/.claude" ] || command -v claude &>/dev/null; then
  mkdir -p "$PROJECT_DIR/.claude/commands"
  # Adjust paths in the skill to point to think-in-html/core/ instead of core/
  sed 's|core/|think-in-html/core/|g' "$SOURCE_DIR/.claude/commands/think-in-html.md" \
    > "$PROJECT_DIR/.claude/commands/think-in-html.md"
  echo "  ✓ Claude Code: .claude/commands/think-in-html.md"
  installed_any=true
fi

# Cursor
if [ -d "$PROJECT_DIR/.cursor" ] || [ -d "$HOME/.cursor" ]; then
  mkdir -p "$PROJECT_DIR/.cursor/rules"
  sed 's|core/|think-in-html/core/|g' "$SOURCE_DIR/.cursor/rules/think-in-html.mdc" \
    > "$PROJECT_DIR/.cursor/rules/think-in-html.mdc"
  echo "  ✓ Cursor: .cursor/rules/think-in-html.mdc"
  installed_any=true
fi

# Codex
if [ -f "$PROJECT_DIR/AGENTS.md" ]; then
  echo "" >> "$PROJECT_DIR/AGENTS.md"
  sed 's|core/|think-in-html/core/|g' "$SOURCE_DIR/adapters/codex/AGENTS.md" \
    >> "$PROJECT_DIR/AGENTS.md"
  echo "  ✓ Codex: appended to AGENTS.md"
  installed_any=true
fi

# If no tool detected, install Claude Code by default
if [ "$installed_any" = false ]; then
  mkdir -p "$PROJECT_DIR/.claude/commands"
  sed 's|core/|think-in-html/core/|g' "$SOURCE_DIR/.claude/commands/think-in-html.md" \
    > "$PROJECT_DIR/.claude/commands/think-in-html.md"
  echo "  ✓ Claude Code (default): .claude/commands/think-in-html.md"
  echo "  (No tool detected — installed Claude Code adapter by default)"
fi

# 3. Summary
echo "[3/3] Done!"
echo ""
echo "What was installed:"
echo "  think-in-html/core/    — the engine (template, schema, instructions, builder)"
echo ""
echo "How to use:"
echo "  Claude Code:  /think-in-html path/to/file.js"
echo "  Cursor:       Ask: \"use think-in-html to explain this file\""
echo "  Codex:        Ask: \"run think-in-html on this module\""
echo ""
echo "The output is a single .html file — open it in any browser."
echo ""
