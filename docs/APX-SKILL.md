# APC Skill — for Claude Code, Cursor, Codex

> The contents of this file are designed to be **dropped in as-is** into any IDE that supports markdown skills (Claude Code `~/.claude/skills/`, Cursor `.cursor/rules/`, Codex `~/.codex/skills/`).
>
> Save it as `apf.md` (or `SKILL.md`) inside your skills directory.

---

```markdown
---
name: apf
description: Detect and operate APC (Agent Project Framework) projects from any IDE. Use this skill whenever the working directory contains an AGENTS.md file at its root, or whenever the user mentions agents, memory, sessions, skills, or MCPs in the context of a project. Operates entirely through the `apx` CLI — no IDE-specific MCPs needed.
---

# APC — Agent Project Framework

## What is APC

APC is a portable protocol for AI-agent projects. A project is a directory that contains:

- `AGENTS.md` — declares the agents (one H2 per agent, slug as title, fields as `- **Field**: value` bullets)
- `.apc/project.json` — project metadata
- `.apc/agents/<slug>/memory.md` — persistent memory per agent
- `.apc/agents/<slug>/sessions/` — session logs (one markdown file per session, ISO-8601 prefixed)
- `.apc/skills/` — reusable skills referenced by agents
- `.apc/mcps/` — per-project MCP server registry

A local background daemon (`apx`) on `http://localhost:7430` exposes all of the above as a REST API and proxies MCP calls.

## Detecting an APC project

Before doing anything else, check if you're in an APC project:

```bash
# Walk up from cwd looking for AGENTS.md + .apc/project.json
apx project list 2>/dev/null
```

Or directly:

```bash
test -f AGENTS.md && test -f .apc/project.json && echo "APC project" || echo "not APC"
```

If the user is in a non-APC project and asks for agent-y things, suggest:

```bash
apx init --name "<project name>"
```

## Always operate via `apx`

**Never** edit `.apc/` files by hand or invent your own MCP wiring. Use the CLI for everything. The daemon keeps SQLite, Telegram, conversations, and MCP registry in sync.

| Task | Command |
|---|---|
| List agents | `apx agent list` |
| Read an agent's memory | `apx memory <slug>` |
| Append to memory | `apx memory <slug> --append "<line>"` |
| List sessions | `apx session list [<slug>]` |
| Create a session log | `apx session new <slug> --title "..." --body -` (body from stdin) |
| Anti-collision check | `apx session check` (exit 1 if another agent is mid-task) |
| List MCP servers | `apx mcp list` |
| Audit MCP merge | `apx mcp check` |
| Call an MCP tool | `apx mcp run <name> <tool> '<json-args>'` |
| One-shot LLM call | `apx exec <agent> "<prompt>"` |
| Interactive LLM chat | `apx chat <agent>` |
| Spawn an external CLI | `apx run <agent> --runtime claude-code "<prompt>"` |
| Detect installed CLIs | `apx env detect` |
| Tail messages | `apx messages tail --agent <slug> -n 20` |
| Send Telegram | `apx telegram send "<text>"` |

## Important: report your own session path

If you are running inside Claude Code, Codex, OpenCode, or any other CLI agent that maintains its own session/transcript file, **tell the operator (and APX) where that file lives** when you start work. APX does not own external transcripts — but it can index them by path. A useful one-liner at session start:

```bash
# Claude Code: session path is typically ~/.claude/projects/<encoded-cwd>/<session-id>.jsonl
echo "$CLAUDE_SESSION_PATH" >> .apc/agents/<your-slug>/sessions/$(date -u +%Y-%m-%d)-claude-handoff.md
```

Or just mention the path in your APC session log when you create it:

```bash
apx session new <slug> --title "Working session — Claude Code" --body "External transcript: ~/.claude/projects/.../session-<id>.jsonl"
```

This lets a future operator (human or agent) replay the full transcript if needed without APX having to scrape it live.

## The killer pattern

You don't need MCPs registered in the IDE. The project owns the MCP registry. To call any tool from any project's MCP catalogue:

```bash
apx mcp run filesystem read_file '{"path":"./README.md"}'
apx mcp run brave search '{"query":"recent papers on RLHF"}'
```

Output is JSON. Pipe to `jq`. Compose with other shell commands. Read it back into the conversation.

## Workflow guidance

When the user asks you to:

- **"Update sofia's memory with X"** → `apx memory sofia --append "X"`. Don't rewrite the whole file unless asked.
- **"Log this conversation as a session"** → `apx session new <slug> --title "..." --body -`. Pipe a concise summary, not the verbatim transcript, unless asked.
- **"Notify me on Telegram when..."** → use `apx telegram send` at the right moment in your reply. Don't promise a future notification you can't actually trigger.
- **"What did sofia work on this week?"** → `apx session list sofia` and read the relevant files; or `apx messages search "<query>"`.
- **"Add a new agent for X"** → `apx agent add <slug> --role <R> --model <M> --skills <s1,s2>`.

## Daemon hygiene

If `apx` commands fail with `ECONNREFUSED 127.0.0.1:7430`, run `apx daemon start` and retry once. If it fails again, surface the error to the user — don't keep retrying.

## What NOT to do

- Don't write to `.apc/agents/<slug>/memory.md` with `Edit`/`Write` directly. Use `apx memory`.
- Don't add agents by editing `AGENTS.md` by hand. Use `apx agent add`.
- Don't shell out to MCPs directly with `npx`/`uvx`. Use `apx mcp run` so the daemon manages process lifecycle.
- Don't store secrets (Telegram tokens, API keys) in the project tree. They live in `~/.apx/config.json`.
```

---

## Why this skill is short

Long skills get ignored or cherry-picked. This one fits in a model's working memory and gives a single bash-shaped surface (`apx`) that already encapsulates every APC operation. The model never has to reason about file paths inside `.apc/`.
