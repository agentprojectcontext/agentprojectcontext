# APC Specification

**Version:** 0.1.0-draft  
**Status:** Draft

This document defines the first draft of APC, Agent Project Context.

APC standardizes how a project stores agent-readable context on disk. It is intentionally runtime-neutral and editor-neutral.

## 1. Normative language

The key words **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** in this document are to be interpreted as described in RFC 2119.

## 2. Scope

APC covers the portable project context layer:

- project metadata
- agent definitions
- durable memory
- reusable skills
- task or session records
- optional project-owned tool registry hints

APC does **not** define:

- a required runtime
- a required daemon
- a required database
- a required editor
- a required HTTP API

Consumers may add caches, indexes, databases, or transport layers. Those are out of scope unless separately standardized.

## 3. Positioning

APC is complementary to MCP.

- **MCP** connects agents to external tools, services, and data.
- **APC** defines how a project stores its own context.

An APC project MAY include MCP registry hints, but APC does not replace MCP or redefine its transport protocol.

## 4. Project model

Conceptually, APC standardizes a shared project context folder, described generically here as `.xxx/`.

For APC v0.1, the canonical directory name is:

```text
.apc/
```

All normative paths in this specification use `.apc/`.

## 5. APC project detection

A directory is an APC project if and only if both of the following exist at the project root:

- `AGENTS.md`
- `.apc/project.json`

Consumers SHOULD detect the nearest ancestor directory matching those conditions.

## 6. Canonical layout

APC separates two concerns with two distinct locations:

- **Project context** (`.apc/`) — portable, committable, shared with the repo
- **Runtime state** (`~/.apx/projects/<project-id>/`) — local, private, never committed

```text
project-root/
├── AGENTS.md
└── .apc/
    ├── project.json       ← includes a stable "id" field
    ├── agents/
    │   └── <slug>.md      ← definition only (role, model, skills…)
    ├── skills/
    │   └── <name>.md
    └── mcps.json
```

Runtime state lives on the local machine, keyed by the project id:

```text
~/.apx/projects/<project-id>/
└── agents/
    └── <slug>/
        ├── memory.md
        ├── sessions/
        └── conversations/
```

### 6.1 Required paths

| Path | Required | Purpose |
|---|---|---|
| `AGENTS.md` | yes | Root compatibility contract |
| `.apc/project.json` | yes | Project metadata, APC version, and stable project id |

### 6.2 Optional standardized paths — project context

| Path | Required | Purpose |
|---|---|---|
| `.apc/agents/<slug>.md` | no | Structured per-agent definition |
| `.apc/skills/<name>.md` | no | Reusable project instructions |
| `.apc/mcps.json` | no | Project-owned MCP registry hints |

### 6.3 Runtime state paths — local machine only

| Path | Purpose |
|---|---|
| `~/.apx/projects/<project-id>/agents/<slug>/memory.md` | Durable agent memory |
| `~/.apx/projects/<project-id>/agents/<slug>/sessions/` | Session or task records |
| `~/.apx/projects/<project-id>/agents/<slug>/conversations/` | LLM conversation threads |
| `~/.apx/projects/<project-id>/project.db` | Regenerable SQLite cache |

These paths MUST NOT be committed to source control. Consumers MUST NOT write runtime state into `.apc/`.

Consumers MUST ignore unknown files and directories inside `.apc/` unless another APC extension standard defines them.

## 7. Agent slugs

Agent slugs MUST match:

```text
^[a-z][a-z0-9_-]*$
```

Slugs are used in filenames and directory names and therefore MUST remain stable and portable.

## 8. `AGENTS.md`

`AGENTS.md` is the root compatibility contract for APC projects.

APC builds on the broader `AGENTS.md` convention used by multiple tools. The APC-specific grammar is defined in the companion document:

- [AGENTS.md Companion Spec](../spec/AGENTS.md.spec.md)

At minimum, `AGENTS.md` MUST contain:

- one `# Agents` heading
- one `## <slug>` section per declared agent
- field bullets in the form `- **Field**: value`

Free-form markdown outside agent sections MAY be included and SHOULD be preserved by consumers when practical.

## 9. Structured agent definition files

APC also defines an optional structured per-agent file format at:

```text
.apc/agents/<slug>.md
```

This file SHOULD use YAML frontmatter followed by optional body text.

Example:

```markdown
---
role: Reviewer
model: gpt-5
language: en
skills: documentation, release-checklist
tools: filesystem, web-search
description: Reviews behavior changes, test coverage, and regressions.
---

Prefer concrete findings over summaries.
```

### 9.1 Known frontmatter keys

| Key | Type |
|---|---|
| `role` | string |
| `model` | string |
| `language` | string |
| `skills` | comma-separated list or string |
| `tools` | comma-separated list or string |
| `description` | string |

Unknown keys MAY be present and MUST be preserved when possible.

### 9.2 Precedence

If both of the following define the same slug:

- `AGENTS.md`
- `.apc/agents/<slug>.md`

then `.apc/agents/<slug>.md` SHOULD be treated as the authoritative structured definition for that slug, while `AGENTS.md` remains the compatibility surface.

## 10. `.apc/project.json`

`.apc/project.json` stores project metadata.

Minimal example:

```json
{
  "id": "my-project-a1b2c3d4",
  "name": "My Project",
  "version": "0.1.0",
  "apf": "0.1.0",
  "created": "2026-05-08T00:00:00Z"
}
```

### 10.1 Required keys

| Key | Type | Description |
|---|---|---|
| `id` | string | Stable project identifier used to key `~/.apx/projects/<id>/` |
| `name` | string | Human-readable project name |
| `version` | string | Project version |
| `created` | string | ISO-8601 creation timestamp |

The `id` MUST be stable across moves and renames. It SHOULD be generated once at `apx init` time as a slug of the project name plus a short random suffix (e.g. `my-project-a1b2c3d4`) and MUST NOT be changed after the first commit.

### 10.2 APC version key

APC metadata MUST include a spec-version key.

For current on-disk compatibility in this repository, consumers SHOULD accept:

- `apf`
- `apc`

The current reference implementation writes `apf` for historical reasons. Future APC revisions MAY standardize `apc` as the canonical key name.

## 11. Agent memory

Durable agent memory lives on the local machine at:

```text
~/.apx/projects/<project-id>/agents/<slug>/memory.md
```

This file MUST NOT be placed inside `.apc/` or committed to source control. It may contain sensitive runtime content such as conversation summaries, user data, or API responses.

APC v0.1 does not impose a required internal schema for this file. It is intentionally markdown-first and consumer-defined.

Recommended structure:

```markdown
# Memory — reviewer

## Identity
- Reviews behavior changes and risks

## Long-term facts
- Prefer findings-first reviews

## Recent context
- Tracking release doc migration
```

### 11.1 Default agent

When no named agent is active — for example, when an agent runtime is invoked without specifying a role — consumers SHOULD use the slug `default`:

```text
~/.apx/projects/<project-id>/agents/default/memory.md
```

The `default` agent is never declared in `AGENTS.md`. It is an implicit fallback for unrouted context.

## 12. Sessions

Task or session records live on the local machine under:

```text
~/.apx/projects/<project-id>/agents/<slug>/sessions/
```

These files MUST NOT be placed inside `.apc/` or committed to source control.

### 12.1 Filename format

The recommended filename format is:

```text
YYYY-MM-DD-NN.md
```

where:

- `YYYY-MM-DD` is the UTC date prefix
- `NN` is a zero-padded counter for that day

This format keeps records sortable, deterministic, and portable.

### 12.2 Recommended frontmatter

```markdown
---
id: 2026-05-08-01
agent: reviewer
title: Review release note coverage
status: in_progress
started: 2026-05-08T14:32:00Z
completed:
result:
---

# Review release note coverage

...notes...
```

APC v0.1 does not require a single closed vocabulary for status values, but consumers SHOULD preserve values verbatim and avoid lossy rewrites.

## 13. Skills

Reusable project instructions, when present, live at:

```text
.apc/skills/<name>.md
```

Agents MAY reference these by name from either:

- `AGENTS.md`
- `.apc/agents/<slug>.md`

APC does not require a specific internal skill schema beyond plain text portability.

## 14. Optional MCP registry hints

Projects MAY include an MCP registry hint file at:

```text
.apc/mcps.json
```

The file SHOULD use the widely adopted `mcpServers` object shape.

Example:

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

This file is a project-owned hint layer for MCP configuration. It complements MCP and does not replace MCP server definitions elsewhere.

## 15. Source of truth and derived state

Human-meaningful APC state SHOULD live in the filesystem.

Consumers MAY build derived caches, indexes, databases, or projections, but:

- those derived artifacts MUST NOT be treated as more authoritative than the APC filesystem state
- consumers SHOULD be able to rebuild derived state from filesystem state

## 16. Compatibility guidance

Consumers SHOULD:

- read `AGENTS.md` for broad compatibility
- read `.apc/` for project-owned structured context
- preserve unknown keys and unknown files when practical
- avoid rewriting files they do not own

Consumers MUST NOT assume APC requires any single runtime, vendor, or editor integration.

## 17. Out of scope in v0.1

The following are intentionally not standardized by APC v0.1:

- `.apc/rules/`
- shared decision logs such as `decisions.jsonl`
- shared timeline streams such as `timeline.jsonl`
- `.apc/project.db`
- `.apc/messages/`
- `.apc/commands/`
- runtime HTTP APIs
- workflow orchestration semantics

Implementations MAY use such files, but they are not part of the APC portable core unless future APC documents define them.

## 18. Example APC project

Project context — committed to the repository:

```text
MyProject/
├── AGENTS.md
├── .apc/
│   ├── project.json        ← includes "id": "myproject-a1b2c3d4"
│   ├── agents/
│   │   ├── architect.md    ← definition only
│   │   └── reviewer.md     ← definition only
│   ├── skills/
│   │   ├── documentation.md
│   │   └── release-checklist.md
│   └── mcps.json
└── src/
```

Runtime state — local machine only, never committed:

```text
~/.apx/projects/myproject-a1b2c3d4/
├── project.db
└── agents/
    ├── architect/
    │   ├── memory.md
    │   ├── sessions/
    │   └── conversations/
    ├── reviewer/
    │   ├── memory.md
    │   ├── sessions/
    │   └── conversations/
    └── default/            ← implicit fallback when no role is active
        ├── memory.md
        └── sessions/
```

## 19. Versioning

APC versioning SHOULD follow semantic versioning.

- breaking on-disk changes require a major version bump
- additive optional fields may use a minor version bump
- consumers SHOULD warn, rather than fail, on unknown optional fields within the same major version
