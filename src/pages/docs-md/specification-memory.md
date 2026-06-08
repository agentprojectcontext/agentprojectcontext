---
title: Memory
description: APC memory files let projects preserve durable agent-specific context in plain text.
---

# Memory

Memory in APC is durable, curated context tied to a project agent.

It is not raw chat history, runtime-local memory, or private runtime state.

## Location

```text
.apc/agents/<slug>/memory.md
```

This file is optional. Use it only for information safe and useful to share with everyone who can
read the repository.

## Why markdown

APC keeps memory human-readable by default:

- easy to review
- easy to diff
- easy to migrate
- not trapped in one runtime database

## Recommended shape

```markdown
# Memory — reviewer

## Identity
- Reviews behavior changes and risks

## Project facts
- Prefer findings-first reviews

## Durable decisions
- API compatibility matters more than internal file layout during v0.1 migration

## Open project context
- Tracking docs migration for APC
```

## Scope guidance

Good APC memory contains information that remains useful across sessions and across tools:

- stable project responsibilities
- recurring constraints
- long-lived domain facts
- durable team expectations
- decisions and their rationale
- open follow-ups that matter beyond one session

Do not put these in APC memory:

- raw session history
- full transcripts
- auto-generated memories that have not been reviewed
- customer data
- credentials
- personal preferences
- local paths useful only on one machine
- unreviewed model output

Runtime-local memory belongs in the runtime's storage, not in `.apc/`.

For example, APX keeps runtime memory, sessions, messages, conversations, and project runtime files
under `~/.apx/projects/<project-id>/`. APC keeps only curated project memory that is safe to commit.

This means an agent can have two different memory layers:

| Memory layer | Location | Commit? |
|---|---|---|
| Curated project memory | `.apc/agents/<slug>/memory.md` | Yes, only if team-safe |
| Runtime/private memory | Runtime-owned storage such as `~/.apx/projects/<project-id>/` | No |

If a fact is private, personal, temporary, or unreviewed, keep it in runtime memory. If it is durable
project knowledge useful to future contributors, sanitize it and place it in APC memory.

## Project memory vs runtime memory

| | APC `memory.md` | Runtime memory / sessions |
|---|---|---|
| Visibility | Project-shared | Local or runtime-private |
| Location | `.apc/agents/<slug>/memory.md` | Runtime-owned directory such as `~/.apx/projects/<project-id>/` |
| Version control | Commit only if safe | Never commit by default |
| Written by | Human or agent after curation | Runtime |
| Purpose | Durable facts and decisions | Full history, scratch state, private notes |

The intended pattern: agents run sessions locally, then extract meaningful decisions and facts into
`memory.md` only when those facts are safe for the whole project. The session stays local. Curated
project memory travels with the repo.

## Persistence levels

APC defines five visibility levels for `.apc/` content:

| Level | Examples | Default VCS behavior |
|---|---|---|
| `stable` | Agent definitions, skills, rules | Commit |
| `project` | `memory.md`, `AGENTS.md`, `project.json` | Commit |
| `local` | Runtime sessions, chats, caches | Outside `.apc/` or gitignored |
| `private` | Secrets, credentials, `*.secret.json` | Gitignored, never commit |
| `ephemeral` | `tmp/`, build artifacts | Gitignored |

`memory.md` is `project` visibility only after curation. Raw sessions are `local` and never
committed unless the user explicitly exports sanitized content into a separate project document.
