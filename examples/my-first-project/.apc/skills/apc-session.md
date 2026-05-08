# apc-session

You are running inside an **APC (Agent Project Context)** project. APC gives you portable project
context. It does not own raw runtime sessions.

If APX started this run, the APX daemon may have created a local runtime session under:

```text
~/.apx/projects/<project-id>/agents/<your-slug>/sessions/
```

Your runtime may also have its own native transcript path. Do not move raw transcripts into `.apc/`.

## What you should do

### At the start of work

Read `AGENTS.md`, relevant `.apc/agents/<slug>.md`, and safe curated memory if present.

### During work

Save only durable, safe facts to memory:

```bash
apx memory <your-slug> --append "User confirmed the rate limit is 10/s, not 100/s"
```

Update the session status as you progress:

```bash
apx session update <session-id> --status "🔄 implementing X"
```

### At the end

Close the APX runtime session with a one-line result if APX provided a session id:

```bash
apx session close <session-id> --result "Implemented X. Tests pass. PR #142."
```

If you can't run `apx` (sandboxed shell, no PATH), print the result on the **last line** prefixed with `APC_RESULT:`:

```
APC_RESULT: Implemented X. Tests pass. PR #142.
```

APX captures that line automatically and writes it to its local runtime state.

## How another agent picks up where you left off

Tomorrow, an operator or a different runtime can run:

```bash
apx session resume <id>          # see frontmatter + path of your transcript
apx session resume <id> --summary --full  # super-agent summary + tail of the transcript
```

The session file links to your *external* transcript (Claude Code session jsonl, Codex log, etc.) so the next agent has the full context, not just the result line.

## Cross-runtime memory

If you discover a fact relevant beyond this session, append it to memory only after checking it is
safe project context:

```bash
apx memory <your-slug> --append "<fact>"
```

That fact can become part of future runs across Claude Code, Codex, OpenCode, Aider, and direct LLM
calls. Raw sessions stay outside `.apc/`.
