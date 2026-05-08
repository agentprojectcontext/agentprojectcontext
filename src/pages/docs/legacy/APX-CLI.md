# APX CLI Reference

The `apx` command is the human and shell-script entry point to the APX daemon.

It bundles two roles:

1. **Local commands** — work without a running daemon (`apx init`, `apx project rebuild`, etc.).
2. **Daemon commands** — talk to `http://localhost:7430` (`apx mcp run`, `apx telegram send`, etc.). Auto-start the daemon on first call (configurable).

```
apx <command> [subcommand] [args] [--flags]
apx --help
apx --version
```

---

## 1. Bootstrap

### `apx init [path] [--name <name>]`

Initialize a new APC project at `path` (default: `.`). Creates `AGENTS.md`, `.apc/project.json` (with a generated stable `id`), and the runtime state directory at `~/.apx/projects/<id>/`.

```bash
apx init --name "My Agency"
apx init ./agency-b --name "Agency B"
```

### `apx project add <path>`

Register an existing APC project with the daemon so it appears in the API.

```bash
apx project add ~/work/agency-a
```

### `apx project list`

List registered projects with their ids, paths, and agent counts.

### `apx project remove <path|id>`

De-register (does not delete files).

### `apx project rebuild [<path|id>]`

Rebuild SQLite cache from filesystem. Run after a manual `git pull` or batch edits to `~/.apx/projects/<id>/`.

```bash
apx project rebuild               # rebuild current project (cwd auto-detected)
apx project rebuild ~/work/agency-a
```

### `apx project import <github-url> [--into <dir>]`

Clone and register a remote APC project in one step.

```bash
apx project import https://github.com/acme/customer-support-pack
```

---

## 2. Daemon control

### `apx daemon start`

Start daemon in background. Idempotent (no-op if already running).

```bash
apx daemon start              # default port 7430
APX_PORT=7431 apx daemon start
```

### `apx daemon stop`

Graceful shutdown.

### `apx daemon status`

```
$ apx daemon status
running   pid=48211  port=7430  uptime=2h 14m
projects:
  1  /Users/me/work/agency-a    sofia, martin
  2  /Users/me/work/agency-b    luna
```

### `apx daemon logs [--tail N] [--follow]`

Tail the daemon log at `~/.apx/daemon.log`.

---

## 3. Agents

### `apx agent add <slug> [--role R] [--model M] [--skills a,b,c] [--language es-AR]`

Append a new agent to `AGENTS.md`, create `.apc/agents/<slug>.md`, and initialize its runtime directory at `~/.apx/projects/<project-id>/agents/<slug>/`.

```bash
apx agent add sofia --role Support --model claude-haiku-4-5 --skills customer-support
```

### `apx agent list`

```
$ apx agent list
sofia    Support  claude-haiku-4-5
martin   Sales    claude-sonnet-4-6
```

### `apx agent get <slug>`

Print the parsed agent block + memory snapshot.

### `apx agent remove <slug>`

Delete the H2 block from `AGENTS.md` and the `.apc/agents/<slug>.md` definition file. With `--purge`, also removes the runtime directory at `~/.apx/projects/<project-id>/agents/<slug>/`.

---

## 4. Memory

Memory files live at `~/.apx/projects/<project-id>/agents/<slug>/memory.md` — never inside `.apc/`. If no agent slug is active, `default` is used automatically.

### `apx memory <slug>`

Print the memory of an agent. Use `default` when no role is active.

```bash
apx memory sofia
apx memory default
```

### `apx memory <slug> --edit`

Open `memory.md` in `$EDITOR`.

### `apx memory <slug> --append "note text"`

Append a single line under `## Recent context` (creates the section if missing).

### `apx memory <slug> --replace -`

Read new memory body from stdin and overwrite `memory.md`.

```bash
cat new_memory.md | apx memory sofia --replace -
```

---

## 5. Sessions

Sessions are markdown files with YAML frontmatter stored at `~/.apx/projects/<project-id>/agents/<slug>/sessions/`. IDs are `YYYY-MM-DD-NN` (auto-incremented per agent per day). If no agent slug is active, sessions go under `default`. See [APC-SPEC.md](APC-SPEC.md#12-sessions) for the session format.

### `apx session list [<slug>] [--last N]`

List sessions newest-first. Without slug: all agents.

```
$ apx session list sofia
ID               S  AGENT        TITLE
──────────────   ─  ──────────   ────────────────────────────────────────
2026-05-07-02    🔄 sofia        Refund inquiry — order #1234
2026-05-07-01    ✅ sofia        Onboarding nuevo cliente
```

### `apx session new <slug> --title "<title>" [--task-ref REF] [--body -]`

Create a new session log. The id is generated as `YYYY-MM-DD-NN`. Body comes from `--body "<text>"` or stdin if `--body -`.

```bash
apx session new sofia --title "Refund inquiry — order #1234" --task-ref TASK-1234 --body -
```

### `apx session get <id> [--body]`

Print a session's frontmatter (or full body with `--body`). The session id has the form `YYYY-MM-DD-NN`.

### `apx session update <id> [--status S] [--result R] [--title T] [--task-ref REF]`

Mutate frontmatter fields in place. Body is untouched.

### `apx session close <id> [--result "<text>"]`

Sets `status: ✅ Completada` and stamps `completed: <now>`.

### `apx session check`

**Anti-collision guard for multi-agent coordination** (ported from `nicho-apps/tools/session-manager.sh`).

Exits `0` if no session is active (`🔄 En progreso`) or only stale ones remain. Exits `1` if there's an active session younger than 1 hour — a different agent is working, you should wait.

```bash
apx session check && {
  apx session new sofia --title "..." --task-ref "TASK-007"
  # do work
  apx session close <id> --result "..."
}
```

### `apx session close-stale`

Auto-closes any `🔄 En progreso` session older than 1 hour. Sets status to `⚠️ Cerrada automáticamente (stale >1h)` and writes a synthetic result. Run this after a crash or before starting fresh work in a hot directory.

### `apx session resume <id> [--summary] [--full]` (v0.10)

Read back an APC session created by an `apx run` (or any session that has an `external_session_path` in its frontmatter). Useful when you want to pick up where Claude Code / Codex / OpenCode left off without re-asking the agent.

```bash
# Just the metadata
apx session resume 2026-05-08-03

# Plus a super-agent recap of the runtime's transcript
apx session resume 2026-05-08-03 --summary

# Plus the full last 32KB of the runtime's transcript (Claude Code jsonl, etc.)
apx session resume 2026-05-08-03 --summary --full
```

Reads the APC session frontmatter, locates the runtime's external transcript (e.g. `~/.claude/projects/<encoded-cwd>/<session>.jsonl` for Claude Code), and — with `--summary` — passes the tail through the super-agent for a concise recap.

---

## 6. Skills

### `apx skill list`

### `apx skill add <name> [--from <file>]`

Create `.apc/skills/<name>.md` from a template or copy from a file.

### `apx skill show <name>`

---

## 7. MCPs

The MCP registry is a **virtual merge** of `.apc/mcps.json` plus co-existing configs (`.cursor/mcp.json`, `.mcp.json`, `.vscode/mcp.json`, `.roo/mcp.json`, `.gemini/settings.json`). APC wins on conflict. APX never modifies any file outside `.apc/`.

### `apx mcp list`

```
$ apx mcp list
NAME                     EN SOURCE   TRANSPORT  COMMAND/URL
asana                    ✓  apc      stdio      npx -y @asana/mcp-server
filesystem               ✓  apc      stdio      npx -y @modelcontextprotocol/server-filesystem .
github                   ✓  cursor   stdio      npx -y @modelcontextprotocol/server-github
postiz                   ✓  apc      http       https://postiz.example.com/api/mcp
```

### `apx mcp check`

Audit the multi-source merge. Shows which source files are present, which MCP came from where, and any conflicts.

```
$ apx mcp check
Source files:
  ✓ apc      .apc/mcps.json
  ✓ claude   .mcp.json
  ✓ cursor   .cursor/mcp.json
  · vscode   .vscode/mcp.json
  · roo      .roo/mcp.json
  · gemini   .gemini/settings.json

Active entries (after merge):
  NAME                     SOURCE   TRANSPORT  EN
  brave                    apc      stdio      ✗
  filesystem               apc      stdio      ✓
  github                   cursor   stdio      ✓

⚠️  Conflicts (APC rule: first source wins):
  brave: kept "apc", ignored "cursor"
```

### `apx mcp add <name> --command <cmd> [--env KEY=VAL] -- <args...>`

Adds an entry to `.apc/mcps.json` (creates the file if missing). `--` separates apx flags from the MCP's own args.

```bash
apx mcp add filesystem --command npx -- -y @modelcontextprotocol/server-filesystem .
apx mcp add brave --command npx --env BRAVE_API_KEY=xyz -- -y @modelcontextprotocol/server-brave-search
```

### `apx mcp remove <name>`

Removes the entry from `.apc/mcps.json`. **Refuses with a 409** if the MCP comes from another source (e.g. Cursor) — the daemon never touches external config files. The error tells you which file to edit.

### `apx mcp enable <name>` / `apx mcp disable <name>`

Toggles the `enabled` field on an APC-owned entry. Disabled MCPs reject `apx mcp run` with a clear message.

### `apx mcp run <name> <tool> [<json-args>]`

**The killer command.** Calls a tool on a registered MCP through the daemon. Works from any shell, any agent — even MCPs declared in `.cursor/mcp.json` are reachable this way.

```bash
apx mcp run filesystem read_file '{"path":"./README.md"}'
apx mcp run brave search '{"query":"latest LLM benchmarks"}'
```

Output is the raw JSON result. Pipe it into `jq`, into another agent, into anything.

> **v0.1 limitation**: `apx mcp run` only supports stdio MCPs. HTTP/SSE transports (`url` + `headers`) are accepted in the JSON but `run` will reject them with a clear v0.2 message until then.

### `apx mcp tools <name>`

Lists tools exposed by an MCP (calls JSON-RPC `tools/list`). **v0.2.**

### `apx mcp call <name>` (interactive)

Opens an interactive REPL against the MCP. Useful for exploring tools.

---

## 8. LLM engines (v0.2)

APX can talk directly to LLM providers and persist the resulting conversation as an append-only markdown file under `~/.apx/projects/<project-id>/agents/<slug>/conversations/YYYY-MM-DD-NN.md`. Five engines are supported: **anthropic**, **openai**, **ollama**, **gemini**, **mock** (offline echo).

The model id of an agent (`agents.<slug>.Model`) determines the engine. Explicit form: `ollama:llama3.2`, `anthropic:claude-haiku-4-5`. Implicit: `claude-*` → anthropic, `gpt-*`/`o1-*` → openai, `gemini-*` → gemini.

API keys live in `~/.apx/config.json` under `engines.<provider>.api_key`, or as env vars (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`). Ollama needs no key, just `engines.ollama.base_url` (default `http://localhost:11434`).

### `apx exec <agent> "<prompt>" [--model <id>] [--temperature T] [--max-tokens N]`

One-shot LLM call. Builds the system prompt from the agent's memory + skills + role, calls the engine, persists a one-turn conversation, prints the result.

```bash
apx exec sofia "redactá el correo de bienvenida a ACME" --max-tokens 500
apx exec luna "summarize" --model "ollama:llama3.2"
```

### `apx chat <agent> [--conversation <id>] [--model <id>]`

Interactive REPL. Each turn appends to the conversation file. Pass `--conversation <id>` to continue an existing thread.

```
$ apx chat sofia
sofia> hola
< respuesta...
sofia> seguí con eso
< respuesta...
sofia> exit
```

### `apx conversations list <agent>`
### `apx conversations get  <agent> <id>`

Inspect what's stored. List shows id/engine/turn count/status; get prints the full thread turn-by-turn.

---

## 9. External agent runtimes (v0.3)

For agents whose `model` you don't want to call directly, APX can delegate to an existing CLI agent (Claude Code, Codex, OpenCode, Aider). APX **does not** own those conversations — it just spawns the binary, passes the agent's system prompt + the prompt body, captures stdout, logs the invocation. If the runtime tells us where its own session file lives (e.g. Claude Code's session id), we record that path so a future operator can replay the transcript.

### `apx run <agent> --runtime <id> "<prompt>" [--timeout <s>] [--task-ref TASK-...]`

```bash
apx run sofia --runtime claude-code "auditá el último PR"
apx run martin --runtime opencode "revisá el carrito"
```

Supported runtimes:
- `claude-code` → `claude -p ... --output-format json --append-system-prompt ...`
- `codex` → `codex exec ...`
- `opencode` → `opencode run ...`
- `aider` → `aider --message ... --yes-always --no-auto-commits`

**Auto-session (v0.10).** Each `apx run` creates an APC session before spawning the runtime. The system prompt the runtime receives includes an "APC Runtime Context" block with the session id and the apx commands the runtime can use mid-flight (memory append, session update). The runtime can close the session with `apx session close <id> --result "..."` or by printing `APC_RESULT: <line>` on the last stdout line — APX captures it automatically. The runtime's external transcript path (Claude Code's jsonl, etc.) is recorded in the APC session frontmatter so `apx session resume <id>` can replay it later.

### `apx env detect`

Probes which agent CLIs are installed in PATH. Useful before deciding which runtime to assign to which agent.

```
$ apx env detect

RUNTIME:
  ✓ claude-code    claude         2.1.121
  ✓ opencode       opencode       1.14.33
  · codex          codex          (not found)
  · aider          aider          (not found)
ENGINE:
  ✓ ollama         ollama         0.x
TOOL:
  ✓ node           node           v24.x
  ✓ git            git            git version 2.50.1
```

---

## 10. Agent-to-agent (v0.4)

Agents can route messages to each other and, optionally, have the message delivered through the target agent's engine.

### `apx send <from> <to> "<body>" [--deliver]`

Without `--deliver`: just logs an `a2a` message in both directions (so it shows up in `apx messages tail` and in the connections graph).

With `--deliver`: also calls the target agent's engine with a system prompt that includes its memory and an explicit "you just received from <from>" framing, captures the reply, and logs the inverse pair. Loop guard at depth 3.

```bash
apx send sofia martin "tengo descuento de USD 700, ¿lo manejás vos?" --deliver
```

### `apx connections <agent>` (alias `apx graph`)

Mental-map query. Aggregates the messages table by peer, channel, and direction.

```
$ apx connections sofia
PEER             CH         DIR  N    LAST
martin           a2a        out  3    2026-05-07T22:41:12Z
@user            telegram   in   8    2026-05-07T20:11:00Z
```

This is the data feed Pandaproject uses to draw the project's mental map.

---

## 11. Messages

### `apx messages tail [--agent <slug>] [--channel <ch>] [-n 50] [--follow]`

Tail messages from the log.

```bash
apx messages tail --agent sofia --channel telegram -n 20 --follow
```

### `apx messages search "<query>"`

FTS5 search across all messages of the active project.

---

## 12. Telegram (bidirectional)

APX has a built-in Telegram bridge. Two directions:

- **Outbound**: `apx telegram send` posts to Telegram via the daemon.
- **Inbound**: the daemon long-polls `getUpdates` and writes each message to the project's `messages` table on `channel='telegram'`.

When `telegram.route_to_agent` is set in `~/.apx/config.json`, every inbound message is also forwarded to that agent's engine and the reply is sent back automatically — APX becomes a thin Telegram bot whose persona is the APC agent (memory + skills + role baked into the system prompt).

### `apx telegram setup`

Prints the JSON skeleton to paste into `~/.apx/config.json`:

```json
"telegram": {
  "enabled": true,
  "bot_token": "<from @BotFather>",
  "chat_id": "<numeric chat id>",
  "poll_interval_ms": 1500,
  "route_to_agent": "<slug>",          // optional auto-replier
  "respond_with_engine": true          // false = log only, no reply
}
```

After editing, restart the daemon with `apx daemon stop` (any next `apx` command auto-starts it with the new config).

### `apx telegram send "<text>" [--chat <id>]`

Send a message via the daemon. `chat_id` falls back to config.

```bash
apx telegram send "Daily report: 14 leads, 3 escalations to martin"
```

### `apx telegram status`

```
$ apx telegram status
enabled:             true
polling:             true
offset:              42
chat_id:             889721252
route_to_agent:      sofia
respond_with_engine: true
last_update_at:      2026-05-07T22:50:11Z
last_error:          (none)
```

---

## 13. Project config (.apc/config.json)

Per-project overrides of the global `~/.apx/config.json`. Deep-merged: project wins on conflict, arrays replace wholesale, primitives override. Engines/Telegram/super-agent can all be overridden per project.

### `apx config show [--project | --effective]`

```bash
apx config show              # both: project-only overrides + effective
apx config show --project    # only the .apc/config.json contents
apx config show --effective  # the merged result actually used by the daemon
```

### `apx config set <dotted.key> <value>`

Value is JSON-aware (`true`, `42`, `"sofia"`, `["a","b"]`).

```bash
apx config set telegram.route_to_agent '"sofia"'
apx config set engines.ollama.base_url '"http://192.168.1.5:11434"'
```

### `apx config unset <dotted.key>`

---

## 14. Plugins

The daemon loads plugins on boot. Today: just Telegram.

```bash
apx plugins list
apx plugins status telegram
```

---

## 15. Routines (per-project scheduled tasks, v0.6)

Each project has its own `routines` table. The daemon ticks every 5s and fires whatever's due.

Schedule formats: `every:60s`, `every:5m`, `every:1h`, `every:1d`, `once:<iso>` (auto-disables).

Kinds: `heartbeat`, `exec_agent`, `telegram`, `shell`.

### `apx routine add <name> --kind <K> --schedule <S> [--spec '<json>' | --K=V...]`

```bash
# Daily 9am report by an agent over Telegram
apx routine add daily-report \
  --kind exec_agent --schedule "every:1d" \
  --agent sofia \
  --prompt "Resumen de las últimas 24h: ¿qué pasó con los clientes?"

# Heartbeat into messages every minute (cheap liveness signal)
apx routine add tick \
  --kind heartbeat --schedule "every:60s" \
  --message "still alive" --channel "heartbeat"

# Fire a Telegram in 10 minutes, just once
apx routine add reminder \
  --kind telegram --schedule "once:2026-05-08T08:00:00Z" \
  --text "📌 reunión con ACME a las 9"

# Daily disk check
apx routine add disk \
  --kind shell --schedule "every:1h" \
  --command "df -h /Volumes/SSDT7Shield | tail -1"
```

### `apx routine list`

```
NAME              EN KIND       SCHEDULE             NEXT_RUN              LAST
sofia-heartbeat   ✓  heartbeat  every:60s            2026-05-07T23:32:47Z  ✓  2026-05-07T23:31:47Z
telegram-test     ✓  telegram   once:2026-05-07T...  2026-05-07T23:32:12Z  —
```

### Other routine commands

```bash
apx routine get <name>           # full JSON
apx routine run <name>           # manual fire (ignores schedule)
apx routine enable <name>
apx routine disable <name>
apx routine remove <name>
```

---

## 16. Project context resolution

Most commands need to know "which project am I talking about?" Resolution order:

1. Explicit `--project <path|id>` flag
2. `APX_PROJECT` env var
3. Walk up from `cwd` to find `AGENTS.md` + `.apc/project.json`
4. If exactly one project is registered with the daemon, use it
5. Error: ambiguous, show hint to set `--project`

---

## 17. Examples — end-to-end

```bash
# Day one
apx init --name "My Agency"
apx agent add sofia --role Support --model claude-haiku-4-5 --skills customer-support
apx mcp add filesystem --command uvx -- mcp-server-filesystem --root .
apx telegram setup

# In a long-lived terminal (or boot script)
apx daemon start

# Agent (or you) calls a tool from anywhere
apx mcp run filesystem list_directory '{"path":"./.apc"}'

# Log what happened
apx session new sofia --title "Onboarded ACME Corp" --body "Customer asked about plan Team..."

# Notify the team
apx telegram send "✅ Onboarded ACME Corp — full notes in session log"
```
