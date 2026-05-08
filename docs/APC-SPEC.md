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

```text
project-root/
├── AGENTS.md
└── .apc/
    ├── project.json
    ├── agents/
    │   ├── <slug>.md
    │   └── <slug>/
    │       ├── memory.md
    │       └── sessions/
    ├── skills/
    │   └── <name>.md
    └── mcps.json
```

### 6.1 Required paths

| Path | Required | Purpose |
|---|---|---|
| `AGENTS.md` | yes | Root compatibility contract |
| `.apc/project.json` | yes | Project metadata and APC version targeting |

### 6.2 Optional standardized paths

| Path | Required | Purpose |
|---|---|---|
| `.apc/agents/<slug>.md` | no | Structured per-agent definition |
| `.apc/agents/<slug>/memory.md` | no | Durable agent memory |
| `.apc/agents/<slug>/sessions/` | no | Session or task records |
| `.apc/skills/<name>.md` | no | Reusable project instructions |
| `.apc/mcps.json` | no | Project-owned MCP registry hints |

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
  "name": "My Project",
  "version": "0.1.0",
  "apf": "0.1.0",
  "created": "2026-05-08T00:00:00Z"
}
```

### 10.1 Required keys

| Key | Type | Description |
|---|---|---|
| `name` | string | Human-readable project name |
| `version` | string | Project version |
| `created` | string | ISO-8601 creation timestamp |

### 10.2 APC version key

APC metadata MUST include a spec-version key.

For current on-disk compatibility in this repository, consumers SHOULD accept:

- `apf`
- `apc`

The current reference implementation writes `apf` for historical reasons. Future APC revisions MAY standardize `apc` as the canonical key name.

## 11. Agent memory

Durable agent memory, when present, lives at:

```text
.apc/agents/<slug>/memory.md
```

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

## 12. Sessions

Task or session records, when present, live under:

```text
.apc/agents/<slug>/sessions/
```

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

```text
MyProject/
├── AGENTS.md
├── .apc/
│   ├── project.json
│   ├── agents/
│   │   ├── architect.md
│   │   ├── reviewer.md
│   │   ├── architect/
│   │   │   ├── memory.md
│   │   │   └── sessions/
│   │   └── reviewer/
│   │       ├── memory.md
│   │       └── sessions/
│   ├── skills/
│   │   ├── documentation.md
│   │   └── release-checklist.md
│   └── mcps.json
└── src/
```

## 19. Versioning

APC versioning SHOULD follow semantic versioning.

- breaking on-disk changes require a major version bump
- additive optional fields may use a minor version bump
- consumers SHOULD warn, rather than fail, on unknown optional fields within the same major version
