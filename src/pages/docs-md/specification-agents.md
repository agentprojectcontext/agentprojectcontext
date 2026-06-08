---
title: Agents
description: APC uses AGENTS.md as the repository root project contract and .apc/agents for structured agent definitions.
---

# Agents

APC uses `AGENTS.md` as the root project contract for repository-wide context.
Structured agent definitions live in `.apc/agents/`.

## Root contract

At the repository root:

```text
AGENTS.md
```

Typical structure:

```markdown
# Project Context

## Overview

This project maintains a backend API and migration workflow.

## Rules

- Keep public API compatibility during migrations.
- Write concise technical documentation for interface changes.
- Run the repository test command before merge.

## APC Context

Structured agent definitions live in `.apc/agents/*.md`.
Reusable instructions live in `.apc/skills/`.
Path-scoped rules live in `.apc/rules/`.
```

## Structured per-agent files

APC agent definitions use structured files:

```text
.apc/agents/<slug>.md
```

Example:

```markdown
---
name: architect
model: inherit
description: Defines architecture and migration strategy.
skills: documentation, release-checklist
color: indigo
emoji: 🏛️
vibe: Designs systems that survive the team that built them. Every decision has a trade-off — name it.
---

Prioritize durable interfaces and migration safety.
```

## Required and optional fields

Recommended frontmatter:

| Field | Required | Purpose |
|---|---:|---|
| `name` | Yes | Stable agent name or slug |
| `model` | Yes | Use `inherit` unless the project truly requires a specific model |
| `description` | Yes | Semantic activation trigger and responsibility summary |
| `is_background` | No | Whether compatible runtimes may run the agent asynchronously |
| `skills` | No | APC skills the agent commonly uses |
| `color`, `emoji`, `vibe` | No | UI/personality hints for runtimes that support them |

APC should not make one vendor's model the default. A model-specific value is allowed only when it
is part of the project contract. Otherwise, use `inherit` and let Codex, Claude Code, Cursor, APX,
or another runtime choose its configured default.

## Relationship

- `AGENTS.md` is the broad root project surface.
- `.apc/agents/<slug>.md` is the structured agent definition.

Compatible consumers read `AGENTS.md` for repository-wide rules and `.apc/agents/<slug>.md` for
agent-specific metadata.
