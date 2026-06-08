---
title: Rules
description: APC rules define reusable project guidance, including path-scoped MDC rules compatible tools can project into IDE-specific rule systems.
---

# Rules

Rules are durable instructions that guide agent behavior for a project.

APC supports two rule surfaces:

- `AGENTS.md` for the root project contract
- `.apc/rules/` for reusable or path-scoped project rules

## Root rules

Use `AGENTS.md` for instructions every compatible agent should see when it enters the repository:

- security boundaries
- build and test requirements
- coding standards
- repository-wide conventions
- rules that should apply regardless of file path

This makes `AGENTS.md` the broad, direct, total project rule surface.

## Path-scoped rules

Use `.apc/rules/` for rules that should load only for specific parts of the repository or specific
tasks.

Recommended file types:

```text
.apc/rules/backend.mdc
.apc/rules/frontend.mdc
.apc/rules/security-review.md
```

Prefer MDC-style frontmatter when a rule has path scope:

```mdc
---
description: Backend API rules
globs:
  - "src/api/**/*.ts"
alwaysApply: false
---

- Validate request input at the route boundary.
- Keep database writes inside service functions.
```

Compatible consumers may project `.apc/rules/*.mdc` into Cursor `.cursor/rules/`, Claude
`.claude/rules/`, or another runtime-specific rule system. APC remains the project-owned source.

## Rules vs skills

Use the smallest surface that matches the intent:

| Intent | APC location |
|---|---|
| Applies to the whole repository | `AGENTS.md` |
| Applies to certain paths or tasks | `.apc/rules/` |
| Reusable procedure an agent may invoke | `.apc/skills/` |
| Broad human policy | repository docs |

Rules should stay concise, concrete, and reviewable. Avoid dumping long transcripts, model
reasoning, or unreviewed generated output into rules.

## Future direction

APC rules can evolve without requiring every tool to read `.apc/` natively. A runtime may keep its
own files for execution, while `.apc/rules/` stays the stable project source that prevents duplicated
or drifting guidance.
