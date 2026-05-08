# APC Overview

> APC, Agent Project Context, is a portable convention for storing agent-readable project context inside a project folder.

## 1. Why APC exists

Projects increasingly depend on agent instructions, memory, task history, and tool wiring. In practice, that context often ends up fragmented across product-specific locations:

- `.claude/`
- `.cursor/`
- `.windsurf/`
- `.codex/`
- `.opencode/`

That fragmentation creates predictable problems:

- the same agent definition gets copied into multiple places
- one tool sees instructions another tool cannot
- memory lives in runtime-specific state instead of the repository
- context becomes difficult to diff, review, migrate, or recover

APC addresses that by giving the project one shared context layer.

## 2. Core idea

Before focusing on any exact folder name, APC starts from a general model:

> an agentic project should expose its own context through one dedicated project folder that compatible tools can read

In the current draft, the canonical folder name is:

```text
.apc/
```

The name matters because portable tooling needs a default. The principle matters more: the project owns the context layer.

## 3. APC is a layer, not a runtime

APC does not define how an agent executes. It defines how a project stores context that an agent or runtime can consume.

Examples of APC consumers include:

- local CLI runtimes
- editor integrations
- background daemons
- automation layers
- repository-aware agents

Those consumers may add caches, indexes, databases, or UI layers, but those are implementation details. APC focuses on the portable filesystem contract.

## 4. APC and MCP

APC is complementary to MCP.

| Layer | Purpose |
|---|---|
| **APC** | Store project-owned agent context inside the repository |
| **MCP** | Connect agents to external tools, services, and data |

Typical combination:

- APC defines the project's agents, skills, memory, and session records
- MCP provides access to tools such as filesystem, GitHub, databases, or deployment systems

APC should not be presented as a replacement for MCP because they solve different problems.

## 5. Design goals

### Portable

A project should keep its agent context when moved between IDEs, CLIs, and machines.

### Human-readable

The important source of truth should remain understandable in plain text.

### Neutral

The layout should not assume one model provider, one vendor, or one editor.

### Incremental

Projects should be able to adopt APC without rebuilding their entire tooling stack.

### Composable

APC should coexist with AGENTS.md, MCP, runtime metadata, and project documentation.

## 6. Canonical APC layout

```text
project-root/
├── AGENTS.md
└── .apc/
    ├── project.json
    ├── agents/
    │   ├── architect.md
    │   ├── reviewer.md
    │   ├── architect/
    │   │   ├── memory.md
    │   │   └── sessions/
    │   └── reviewer/
    │       ├── memory.md
    │       └── sessions/
    ├── skills/
    │   ├── documentation.md
    │   └── release-checklist.md
    └── mcps.json
```

This layout reflects the current draft and the reference implementation in this repository.

## 7. Main building blocks

### `AGENTS.md`

Root-level compatibility contract for agent discovery. Many tools already know how to read it.

### `.apc/project.json`

Project metadata and APC version targeting information.

### `.apc/agents/<slug>.md`

Structured per-agent definition files. These are useful when tools need a stable machine-readable source beyond the root markdown contract.

### `.apc/agents/<slug>/memory.md`

Durable memory for one agent. APC intentionally keeps the contents flexible.

### `.apc/agents/<slug>/sessions/`

Task or session records. These make work history project-owned rather than runtime-owned.

### `.apc/skills/<name>.md`

Reusable project instructions agents can reference by name.

### `.apc/mcps.json`

Optional project-owned MCP registry hints using the common `mcpServers` shape. This complements MCP rather than redefining it.

## 8. Relationship to `AGENTS.md`

APC builds on, rather than replaces, `AGENTS.md`.

The practical model is:

- `AGENTS.md` is the broad compatibility surface
- `.apc/` carries structured project-owned context

In the current reference implementation:

- tools may read agents directly from `AGENTS.md`
- if `.apc/agents/<slug>.md` files exist, they take precedence for the same slug
- `AGENTS.md` can still be regenerated or maintained as the compatibility view

That split lets APC stay useful to both humans and machines.

## 9. Relationship to runtime-specific files

An APC project may still contain tool-specific folders. APC does not forbid them.

The recommended direction is:

- keep project-owned context in `.apc/`
- keep runtime-only or editor-only preferences in their own folders
- avoid duplicating the same semantic instructions across both whenever possible

This keeps the project's long-lived context separate from the current execution environment.

## 10. Example

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

Example `AGENTS.md`:

```markdown
# Agents

## architect
- **Role**: System design
- **Model**: claude-sonnet-4-6
- **Skills**: documentation, release-checklist
- **Description**: Defines architecture, constraints, and migration strategy.

## reviewer
- **Role**: Code review
- **Model**: gpt-5
- **Skills**: documentation
- **Description**: Reviews behavior changes, risks, tests, and edge cases.
```

Example `.apc/agents/architect.md`:

```markdown
---
role: System design
model: claude-sonnet-4-6
skills: documentation, release-checklist
description: Defines architecture, constraints, and migration strategy.
---

Prioritize durable interfaces, migration safety, and clear documentation.
```

## 11. What APC does not try to standardize in v0.1

APC v0.1 intentionally leaves several areas open:

- a shared `.apc/rules/` directory
- a normalized decision log format
- a standardized timeline or event stream
- a required database or index
- workflow orchestration semantics
- runtime APIs

Those may become future APC extensions, but they are not part of the portable core yet.

## 12. Next reading

- [APC Specification](APC-SPEC.md)
- [AGENTS.md Companion Spec](../spec/AGENTS.md.spec.md)
