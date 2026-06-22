# Think-In-HTML

Turn a piece of code into an explorable, interactive lesson — in one command.

Think-In-HTML takes a file, module, or code flow and generates a **single self-contained `.html` file** that explains it like a teacher would. Open it in any browser, share it with anyone — no server, no install, no dependencies.

<!-- TODO: Add GIF/screenshot of a generated explainer here -->

## Why

Reading code is hard. Reading someone else's code is harder. And if you're not a developer at all, it's nearly impossible.

Think-In-HTML turns this:
```
a folder of source files you've never seen before
```
Into this:
```
one interactive HTML page where a teacher walks you through it step by step
```

Every explainer includes:
- **Plain-language explanations** — like a patient teacher, not like API docs
- **Visual flow diagram** — see how the pieces connect at a glance
- **Guided walkthrough** — step through the main flow with "Next / Got it" progression
- **Progress meter** — see how much you've explored
- **End-of-flow quiz** — check your understanding with explained answers
- **Glossary** — hover any term for an instant definition
- **Beginner ↔ Technical toggle** — same artifact serves a complete beginner and a senior engineer

The output is **one `.html` file**. No server. No build step. Drag it into a browser, attach it to a PR, send it on Slack. It just works.

## Install

### With npm / npx (recommended)

No install needed — run it on demand with `npx` (requires [Node.js](https://nodejs.org) ≥ 18):

```bash
# Wire the AI adapter into your current project (auto-detects Claude Code, Cursor, Codex)
npx think-in-html init
```

Or install it globally to use the `think-in-html` command anywhere:

```bash
npm install -g think-in-html
```

That's the whole setup. The package contains the engine; your AI tool calls it via
`npx think-in-html` under the hood — nothing is copied into your repo.

### CLI commands

```bash
think-in-html init                                   # wire the adapter into this project
think-in-html instructions code                      # print the analysis guide (code|thinking|text)
think-in-html build analysis.json -o output.html     # build a lesson from an analysis file
think-in-html --help
```

### Without npm (curl one-liner)

No Node? This copies the engine + adapter into your project:

```bash
curl -fsSL https://raw.githubusercontent.com/vibhusharma101/Think-In-HTML/main/install.sh | bash
```

## Usage

### Claude Code
```
/think-in-html src/auth/login.ts
/think-in-html src/api/ --mode code
/think-in-html thinking-log.txt --mode thinking
```

### Cursor
Ask in chat:
> "Use think-in-html to explain src/auth/login.ts"

### Codex
Ask:
> "Run think-in-html on src/api/"

### Output
Every command produces a single `output.html` — open it in your browser.

## Who is this for?

| You are... | What you get |
|---|---|
| **A developer** onboarding to a new codebase | A visual map of the main flow — skip reading every file |
| **A beginner** learning to code | A teacher-style walkthrough with zero assumed knowledge |
| **A team lead** documenting a critical flow | A shareable interactive artifact that lives alongside the code |
| **A reviewer** trying to understand a PR | An explainer of the changed module's flow |
| **Non-technical** and need to understand what the code does | Plain-language explanations with a guided tour |

## How it works

```
Your code
   ↓
AI reads core/instructions/ → emits analysis.json (validated against a schema)
   ↓
Pre-built HTML shell renders the JSON → one self-contained output.html
```

The AI only produces **structured data** (the understanding). A pre-built, tested renderer turns it into the interactive experience. This means consistent, working output every time — not brittle LLM-generated HTML.

### Works with any AI coding tool

Think-In-HTML is **not locked to one tool**. The core engine is portable — thin adapters wire it into whatever you use:

| Tool | Adapter location | Auto-invocation |
|------|-----------------|-----------------|
| Claude Code | `.claude/commands/think-in-html.md` | `/think-in-html <target>` |
| Cursor | `.cursor/rules/think-in-html.mdc` | Activates on matching intent |
| Codex | `AGENTS.md` section | Ask in natural language |
| Any other | See [adapters/README.md](adapters/README.md) | Write a thin adapter |

## Modes

| Mode | Input | Status |
|------|-------|--------|
| **Code** (flagship) | A file, module, or flow | v1 |
| **Thinking** | AI reasoning transcript | Planned |
| **Text** | Any text or markdown | Planned |

## Examples

See the [`examples/`](examples/) folder for generated explainers you can open right now.

<!-- TODO: Add links to hosted examples once gallery is built -->

## Privacy

The generated HTML embeds source code into a shareable file. **Only share artifacts for code you own or have permission to distribute.**

## Contributing

Want to add support for a new AI tool? See [adapters/README.md](adapters/README.md) — it's a single thin file.

Want to add a new mode (e.g., "database schema explorer")? Write a `mode-*.md` instruction file and extend the schema. See [the schema](core/schema/analysis.schema.json) and existing mode files for the pattern.

## Maintainers

Publishing a new version to npm? See [PUBLISHING.md](PUBLISHING.md).

## License

[MIT](LICENSE)
