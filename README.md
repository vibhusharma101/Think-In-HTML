# Think-In-HTML

Turn a piece of code into an explorable, interactive lesson — in one command.

Think-In-HTML takes a file, module, or code flow and generates a **single self-contained `.html` file** that explains it like a teacher would. Open it in any browser, share it with anyone — no server, no install, no dependencies.

## What it does

Point any AI coding tool at your code. Get back an interactive HTML explainer with:

- **Teacher-first explanations** — plain language by default, technical detail on demand
- **Visual flow diagram** — see how the pieces connect at a glance
- **Guided walkthrough** — step through the main flow with narration and a progress meter
- **Check-your-understanding quiz** — lightweight gamification to reinforce learning
- **Glossary** — hover any term for an instant definition

The output is one `.html` file. Drag it into a browser. Send it to a teammate. Drop it in a PR. It just works.

## Who it's for

- **Developers** onboarding to an unfamiliar codebase
- **Beginners** learning to read code for the first time
- **Teams** documenting how a critical flow works
- **Anyone** who wants to understand code without reading every line

## Works with any AI coding tool

Think-In-HTML is **not locked to one tool**. The core engine is portable — thin adapters wire it into:

| Tool | Adapter |
|------|---------|
| Claude Code | `adapters/claude-code/SKILL.md` |
| Cursor | `adapters/cursor/think-in-html.mdc` |
| Codex | `adapters/codex/AGENTS.md` |
| Any other | Follow `adapters/README.md` |

## How it works

```
Your code
   ↓
AI reads core/instructions/ → emits analysis.json (validated against a schema)
   ↓
Tested HTML shell renders the JSON → one self-contained output.html
```

The AI only produces **structured data** (the understanding). A pre-built, tested renderer turns it into the interactive experience. This means consistent, working output every time — not brittle LLM-generated HTML.

## Quick start

_Coming in M1. The core template and schema are being built now._

## Modes

| Mode | Input | Status |
|------|-------|--------|
| **Code** (flagship) | A file, module, or flow | v1 |
| **Thinking** | AI reasoning transcript | Planned |
| **Text** | Any text or markdown | Planned |

## Privacy

The generated HTML embeds your source code. Only share artifacts for code you own or have permission to distribute.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) _(coming in M5)_.

## License

[MIT](LICENSE)
