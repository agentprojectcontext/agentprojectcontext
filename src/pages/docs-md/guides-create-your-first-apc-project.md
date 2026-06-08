---
title: Create Your First APC Project
description: A practical walkthrough for creating a minimal APC-compatible repository structure.
---

# Create Your First APC Project

This guide shows a minimal APC-compatible repository layout.

## 1. Create the root contract

Create `AGENTS.md` at the repository root:

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

## 2. Create the APC directory

```text
.apc/
```

## 3. Add project metadata

Create `.apc/project.json`:

```json
{
  "name": "My Project",
  "version": "0.1.0",
  "apc": "0.1.0",
  "created": "2026-05-08T00:00:00Z"
}
```

## 4. Add at least one skill

Create `.apc/skills/documentation.md`:

```markdown
# documentation

Write protocol and specification text in a neutral, technical tone.
```

## 5. Add rules if needed

Use `AGENTS.md` for repository-wide rules. For path-scoped rules, create `.apc/rules/backend.mdc`:

```mdc
---
description: Backend API rules
globs:
  - "src/api/**/*.ts"
alwaysApply: false
---

- Validate request input at the route boundary.
```

## 6. Add durable plans if needed

Create `.apc/plans/migration-plan.md` only when the plan is safe to share and useful beyond one
runtime session.

## 7. Add structured agent files

```text
.apc/agents/architect.md
```

This gives compatible tools a stable machine-readable location for agent metadata.

Recommended frontmatter:

```markdown
---
name: architect
model: inherit
description: Defines architecture and migration strategy.
skills: documentation
---
```

## 8. Add curated project memory if needed

Memory is optional. Add it only for curated facts safe to share with everyone who can read the
repository.

Create `.apc/agents/architect/memory.md`:

```markdown
# Memory — architect

## Identity
- Owns architecture and specification clarity
```

## 9. Keep sessions with their runtime

Your IDE, CLI, or APX daemon keeps raw runtime state in its own local storage. APX, for example,
keeps sessions, conversations, messages, local runtime memory, and project runtime files under
`~/.apx/projects/<project-id>/`. If a session produces durable project knowledge, extract a short
sanitized fact into APC memory or docs.

## Result

You now have a portable project context layer that can travel with the repository.
