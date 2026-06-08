---
title: Migrate from IDE-Specific Context
description: Move duplicated agent context out of tool-specific folders into a shared APC layer.
---

# Migrate from IDE-Specific Context

The most common APC adoption path is migration from fragmented editor-specific state.

## Typical starting point

A project may already have context spread across:

- `.claude/`
- `.cursor/`
- `.windsurf/`
- `.codex/`
- `.opencode/`

## Migration strategy

### 1. Inventory durable context

Separate project-owned meaning from runtime-local state.

Project-owned:

- agent roles
- stable instructions
- path-scoped rules
- reusable workflows
- durable plans
- curated project memory
- MCP expectations without secrets

Runtime-local:

- API keys
- personal aliases
- UI preferences
- machine-local paths
- raw sessions
- provider transcripts
- tool call logs
- local message stores
- private runtime memory
- runtime databases
- unreviewed auto memories
- scratch plans useful only inside one session

### 2. Consolidate root project rules

Move repository-wide rules, stack notes, commands, and testing policy into `AGENTS.md`.

### 3. Move agent definitions

Move shared agent definitions into `.apc/agents/<slug>.md`.

### 4. Extract reusable instructions

Move repeated instruction blocks into `.apc/skills/`.

### 5. Move rules by scope

Use `AGENTS.md` for root rules that should apply everywhere. Move path-scoped rules into
`.apc/rules/`, preferably as MDC-compatible files when they need `globs`.

### 6. Preserve durable plans

Move project-owned plans into `.apc/plans/` only when they are safe to share and useful beyond one
runtime session. Leave private scratch planning state with the IDE or runtime that created it.

### 7. Create curated project memory files

Move only curated long-lived facts from chat history or hidden runtime stores into
`.apc/agents/<slug>/memory.md`.

### 8. Add MCP hints only if they are project-owned

If the project expects certain MCP servers, document them in `.apc/mcps.json`.

Keep secrets in the user's environment, runtime config, or managed secret store. Do not commit
literal tokens in `env`, `headers`, URLs, query strings, or arguments.

### 9. Leave sessions with their runtime

Recommended behavior:

- Codex keeps Codex sessions in Codex storage
- Claude Code keeps Claude sessions in Claude storage
- OpenCode keeps OpenCode state in OpenCode storage
- APX keeps sessions, messages, conversations, local runtime memory, and project runtime files
  in `~/.apx/projects/<project-id>/`

If the project needs continuity, write a short sanitized decision summary into APC memory or docs.

## Source vs projection

APC should be the project-owned source of shared context. Tool-specific files may still exist as
runtime projections.

| Tool area | APC source | Tool-specific projection |
|---|---|---|
| Root project rules | `AGENTS.md` | `CLAUDE.md` importing `AGENTS.md`, or runtime-specific guidance |
| Agent definitions | `.apc/agents/<slug>.md` | `.claude/agents/`, Codex/Cursor/APX runtime agent config |
| Path-scoped rules | `.apc/rules/*.mdc` | `.cursor/rules/`, `.claude/rules/` |
| Durable plans | `.apc/plans/` | Cursor or IDE planning UI/files when needed |
| MCP expectations | `.apc/mcps.json` | `.cursor/mcp.json`, Claude `.mcp.json`, Codex/APX MCP config |
| Curated project memory | `.apc/agents/<slug>/memory.md` | Imported or read by compatible runtime |
| Runtime/private memory | none | `~/.codex/`, `~/.claude/`, `~/.cursor/`, `~/.apx/projects/<id>/` |

Project context moves into APC; runtime mechanics stay in the runtime.

## Keep tool-specific files where needed

APC does not require deleting every tool-specific folder. The goal is to stop duplicating the same
project meaning across all of them.

Keep tool-specific files when they contain runtime mechanics, UI settings, or private state. Remove
or shrink them when they only duplicate project meaning already represented by APC.
