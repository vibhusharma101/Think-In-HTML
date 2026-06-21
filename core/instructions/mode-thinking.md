# Mode: Thinking

You are analyzing an AI reasoning transcript (e.g., Claude's extended thinking output).

## What to produce

1. **Nodes** — one per distinct reasoning step or decision point. Use `kind: "step"`.
2. **Edges** — `leadsTo` for the reasoning chain. Mark dead-ends or abandoned paths.
3. **Walkthrough** — narrate the reasoning as a journey: "First the model considered...,
   then it realized..., which led to..."
4. **Glossary** — define any technical concepts the reasoning references.
5. **Quiz** — test whether the reader understood *why* the model reached its conclusion.
6. **Summary** — what question was being answered and what conclusion was reached.

_Full implementation planned for post-v1._
