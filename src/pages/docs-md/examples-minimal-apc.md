---
title: Minimal APC Example
description: A compact example of an APC-compatible repository layout.
---

# Minimal APC Example

```text
my-project/
├── AGENTS.md
└── .apc/
    ├── .gitignore
    ├── project.json
    ├── mcps.json
    ├── rules/
    │   └── backend.mdc
    ├── plans/
    │   └── migration-plan.md
    ├── skills/
    │   └── documentation.md
    └── agents/
        ├── architect.md
        └── architect/
            └── memory.md
```

## `AGENTS.md`

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

## `.apc/project.json`

```json
{
  "name": "my-project",
  "version": "0.1.0",
  "apc": "0.1.0",
  "created": "2026-05-08T00:00:00Z"
}
```

## `.apc/agents/architect.md`

```markdown
---
name: architect
model: inherit
description: Owns system structure and migration safety.
skills: documentation
color: indigo
emoji: 🏛️
vibe: Designs systems that survive the team that built them.
---

Prioritize durable interfaces and migration safety.
```

## `.apc/rules/backend.mdc`

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

## `.apc/plans/migration-plan.md`

```markdown
---
title: Migration plan
status: active
owner: architect
updated: 2026-06-08
---

# Migration plan

## Goal
- Move shared agent context into APC without committing runtime state.
```

## `.apc/skills/documentation.md`

```markdown
# documentation

Write concise technical docs with explicit scope and terminology.
```

## `.apc/agents/architect/memory.md`

```markdown
# Memory — architect

## Identity
- Owns system structure and migration safety

## Project facts
- API compatibility matters during migration
```

## `.apc/mcps.json`

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
    }
  }
}
```

No sessions are stored in `.apc/`. Raw runtime history stays with the IDE, CLI, or daemon that
created it.
