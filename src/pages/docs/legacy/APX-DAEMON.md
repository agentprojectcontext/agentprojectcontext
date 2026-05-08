# APX Daemon (v0.1)

> Local background process that turns any APC project on disk into a queryable, message-driven service on `http://localhost:7430`.

**APC** is the protocol on disk. **APX** is the runtime that serves it.

---

## 1. Why a daemon

Without a daemon, every IDE and every script that wants to talk to an APC project has to:

- Re-parse `AGENTS.md`
- Re-load each MCP server in its own config
- Reinvent message logging
- Reinvent Telegram glue

The daemon centralizes all of that on one local port. Anything that speaks HTTP can drive an APC project: bash scripts, IDE skills, the React frontend, n8n flows, GitHub Actions runners on the same machine.

---

## 2. Lifecycle

```bash
apx daemon start          # start in background, write PID to ~/.apx/daemon.pid
apx daemon stop
apx daemon status         # prints port, uptime, registered projects
apx daemon logs --tail 100
```

The daemon binds **only to `127.0.0.1`**. It is not exposed on the network and has no auth in v0.1 — local trust is the security model.

Default port: `7430`. Override via `~/.apx/config.json` or `APX_PORT` env var.

### Cross-platform notes

- macOS / Linux: standard `node` + `nohup` background fork. PID + log in `~/.apx/`.
- Windows: same approach using `child_process.spawn(... { detached: true })` and `process.unref()`. Paths use `path.join` everywhere; home dir via `os.homedir()`. No POSIX-only signals — `apx daemon stop` posts `/admin/shutdown` and falls back to `process.kill(pid)`.

---

## 3. Configuration

### 3.1 Global config — `~/.apx/config.json`

```json
{
  "port": 7430,
  "host": "127.0.0.1",
  "log_level": "info",
  "projects": [
    { "path": "/Users/me/work/agency-a", "id": "agency-a-a1b2c3d4" },
    { "path": "/Users/me/work/agency-b", "id": "agency-b-e5f6g7h8" }
  ],
  "telegram": {
    "enabled": false,
    "bot_token": "",
    "chat_id": "",
    "poll_interval_ms": 1500
  }
}
```

Projects are added with `apx project add <path>` (or by importing a GitHub URL — see Pandaproject vision). Removal: `apx project remove <path>` only de-registers; it never deletes files.

### 3.2 Per-project SQLite

Lives at `~/.apx/projects/<project-id>/project.db`. This SQLite schema is an APX implementation detail layered on top of APC's filesystem contract. The daemon opens one connection per registered project and keeps them warm.

The database MUST NOT be placed inside `.apc/` or committed to source control. It is a fully regenerable cache — `apx project rebuild` reconstructs it from the filesystem sources in `~/.apx/projects/<project-id>/`.

---

## 4. REST API

All endpoints return JSON. Errors: `{ "error": "<message>" }` with appropriate status code.

Base: `http://localhost:7430`

### 4.1 Health & projects

| Method | Path | Purpose |
|---|---|---|
| `GET`  | `/health` | `{ status: "ok", version, uptime_s }` |
| `GET`  | `/projects` | List registered projects |
| `POST` | `/projects` | `{ path }` — register an existing APC project |
| `DELETE` | `/projects/:id` | De-register (does not delete files) |
| `POST` | `/projects/:id/rebuild` | Rebuild SQLite cache from filesystem |

### 4.2 Agents

| Method | Path | Purpose |
|---|---|---|
| `GET`  | `/projects/:pid/agents` | List agents |
| `GET`  | `/projects/:pid/agents/:slug` | Get one agent (config + memory snapshot) |
| `POST` | `/projects/:pid/agents` | `{ slug, role, model, skills, ... }` — append to AGENTS.md |

### 4.3 Memory

Memory is read from and written to `~/.apx/projects/<project-id>/agents/<slug>/memory.md`. The daemon never touches `.apc/` for memory operations.

| Method | Path | Purpose |
|---|---|---|
| `GET`  | `/projects/:pid/agents/:slug/memory` | Read `~/.apx/projects/<id>/agents/<slug>/memory.md` |
| `PUT`  | `/projects/:pid/agents/:slug/memory` | `{ body }` — overwrite memory.md |

If no named agent is active, use `default` as the slug:

```
GET /projects/:pid/agents/default/memory
```

### 4.4 Sessions

Sessions are stored in `~/.apx/projects/<project-id>/agents/<slug>/sessions/`. The daemon never writes session files into `.apc/`.

| Method | Path | Purpose |
|---|---|---|
| `GET`  | `/projects/:pid/agents/:slug/sessions` | List sessions, newest first |
| `POST` | `/projects/:pid/agents/:slug/sessions` | `{ title, body }` — create new session log |
| `GET`  | `/projects/:pid/sessions/:sid` | Read one session by id |

### 4.5 MCPs (per-project, multi-source merge)

The daemon merges MCP definitions from `.apc/mcps.json` plus co-existing tool configs (`.cursor/mcp.json`, `.mcp.json`, `.vscode/mcp.json`, `.roo/mcp.json`, `.gemini/settings.json`). APC wins on conflict. Mutating endpoints only touch `.apc/mcps.json`.

| Method | Path | Purpose |
|---|---|---|
| `GET`  | `/projects/:pid/mcps` | List merged view (with `source`, `transport`) |
| `GET`  | `/projects/:pid/mcps/check` | Audit: source files present, conflicts, attribution |
| `POST` | `/projects/:pid/mcps` | `{ name, command, args, env, url, headers, enabled }` — writes to `.apc/mcps.json` |
| `DELETE` | `/projects/:pid/mcps/:name` | Remove from `.apc/mcps.json`. Returns **409** if the MCP is owned by another source — the daemon never edits external configs |
| `POST` | `/projects/:pid/mcps/:name/call` | `{ tool, params }` — proxy a JSON-RPC `tools/call`. v0.1: stdio only. HTTP/SSE entries return 500 with a clear v0.2 message |

### 4.6 Messages

| Method | Path | Purpose |
|---|---|---|
| `GET`  | `/projects/:pid/messages?agent=&channel=&since=` | Tail/filter |
| `POST` | `/projects/:pid/messages` | `{ channel, direction, agent_slug, body, meta }` |
| `GET`  | `/projects/:pid/messages/search?q=` | FTS5 search |

### 4.7 Engines & conversations (v0.2)

| Method | Path | Purpose |
|---|---|---|
| `GET`  | `/engines` | List provider ids |
| `POST` | `/projects/:pid/agents/:slug/exec`  | One-shot LLM call → new conversation file |
| `POST` | `/projects/:pid/agents/:slug/chat`  | Append to (or start) a conversation |
| `GET`  | `/projects/:pid/agents/:slug/conversations` | List conversations |
| `GET`  | `/projects/:pid/agents/:slug/conversations/:id` | Read full conversation (turns) |

API keys for providers come from `~/.apx/config.json` (`engines.<provider>.api_key`) or env vars (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`). Conversation files live at `~/.apx/projects/<project-id>/agents/<slug>/conversations/YYYY-MM-DD-NN.md` — append-only markdown is the source of truth, the SQLite `conversations` + `conversation_turns` tables are a regenerable cache. Conversation files MUST NOT be stored inside `.apc/`.

### 4.8 Runtimes (external CLI agents, v0.3 → v0.10)

| Method | Path | Purpose |
|---|---|---|
| `GET`  | `/runtimes` | List adapter ids |
| `GET`  | `/env/detect` | Probe installed CLIs (`claude`, `codex`, `opencode`, `aider`, `gemini`, `cursor-agent`, `ollama`, `node`, `python3`, `uv`, `git`) |
| `POST` | `/projects/:pid/agents/:slug/runtime` | `{ runtime, prompt, timeoutMs, title?, task_ref? }` — see flow below |
| `GET`  | `/projects/:pid/sessions/:id/resume?summarize=true` | Read APC session frontmatter + tail of the runtime's external transcript + (optional) super-agent summary |

**Auto-session flow (since v0.10):**

When a runtime POST hits the daemon:

1. Create a session file at `~/.apx/projects/<project-id>/agents/<slug>/sessions/<YYYY-MM-DD-NN>.md` with `status: 🔄 En progreso` and `runtime: <id>` in frontmatter. If no agent slug is active, use `default`.
2. Build the agent's system prompt (description + role + memory + skills) and append the **APC Runtime Context** block — it tells the runtime its session id, the apx commands it can call mid-flight (`apx memory <slug> --append`, `apx session update`), and how to close: `apx session close <id> --result "..."` or print `APC_RESULT: <line>` on the last stdout line.
3. Spawn the runtime via `daemon/src/runtimes/<id>.js`, capture stdout/exit/external_session_path.
4. `closeRuntimeSession` writes the captured external path into the frontmatter, sets status to `✅ Completada` (or `⚠️ Cerrada con error`), result to either the APC_RESULT line or stdout truncated to 200 chars.
5. Log in/out messages on `channel='runtime'` with `meta.apc_session: <id>`.

`apx session resume <id>` reads the file back, optionally tails the external transcript (32KB), and asks the super-agent for a summary. This is how a future operator picks up where the last run left off.

The reusable skill `.apc/skills/apc-session.md` documents this protocol from the runtime's perspective; agents can list it in their `Skills:` field to load it permanently in their system prompt instead of relying on the per-run injected block.

### 4.9 Agent-to-agent (v0.4)

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/projects/:pid/send` | `{ from, to, body, deliver? }` — log a2a message; with `deliver: true` calls target agent's engine and logs the reply pair. Loop guard at depth 3 |
| `GET`  | `/projects/:pid/agents/:slug/connections` | Mental-map: peer × channel × direction aggregates with counts and last-seen ts |

### 4.10 Plugins (v0.5)

The daemon uses a thin plugin registry. Each plugin module gets `{ projects, config, log }` on init and exposes `start/stop/status` (plus optional `routes(app)` to install Express handlers). Telegram is the first plugin; runtimes/messages-indexer/routines will follow this same shape.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/plugins` | Map of plugin id → status object |
| `GET` | `/plugins/:id/status` | One plugin's status |

### 4.11 Super-agent with native tool use (v0.5 → v0.8)

A daemon-level agent that responds when no per-project agent is configured for an inbound. **Function-calling enabled**: the super-agent doesn't synthesize commands — it calls 12 native tools directly through the engine's tool-use API, and loops (max 6 iterations) until it emits a final text answer.

Config:

```json
"super_agent": {
  "enabled": true,
  "name": "apx",
  "model": "ollama:qwen2.5:14b",   /* must support function calling */
  "system": ""                      /* optional override; defaults baked in */
}
```

**Tools exposed** (`daemon/src/super-agent-tools.js`):

| Tool | Purpose |
|---|---|
| `list_projects` | Registered projects (id, name, path, agent count) |
| `list_agents(project)` | Agents in a project (slug, role, model, language, skills) |
| `list_mcps(project)` | MCPs after multi-source merge |
| `read_agent_memory(project, agent)` | Returns `memory.md` |
| `list_files(project, path)` | Path-traversal-safe directory listing |
| `read_file(project, path)` | First 64KB, escape-safe |
| `tail_messages(project, channel?, agent?, limit?)` | Project messages history |
| `search_messages(project, query)` | FTS5 search |
| `call_agent(project, agent, prompt)` | One-shot LLM call to a project agent |
| `call_mcp(project, mcp, tool, args)` | Proxy a tools/call to an MCP |
| `call_runtime(project, agent, runtime, prompt, timeout_s)` | Spawn `claude-code`/`codex`/`opencode`/`aider` with the agent's system prompt; returns stdout + exit_code + external_session_path |
| `send_telegram(channel?, chat_id?, text)` | Outbound TG message |

The system prompt is intentionally short (just a `id: name (path)` index of projects, no inlined details) so the model is forced to call the tools instead of answering from a cached snapshot. `runSuperAgent` returns `{ text, usage, name, trace }` where `trace` is the list of tool calls executed in this turn — useful for debugging.

**Engine support:** `daemon/src/engines/ollama.js` accepts a `tools` parameter and surfaces `tool_calls` from the response. The agent loop appends each tool result back into the conversation as `role: "tool"` and re-invokes the model. Other providers will follow the same shape.

**Pseudo-tool-call fallback (v0.10).** Some models — qwen2.5:14b under Ollama is the canonical case — emit tool calls as plain text inside the response (`<tool_call>{"name":"x","arguments":{...}}</tool_call>` and friends) instead of using the structured `tool_calls` field. `daemon/src/tool-call-parser.js` (`extractPseudoToolCalls`, `cleanTextOfPseudoToolCalls`) detects these by walking the text for balanced JSON objects with a `{name, arguments}` shape, the agent loop treats them identically to real tool_calls, and the user-facing text is cleaned of the leftover JSON before sending. No human ever sees `_icall()` or `<tool_call>` in their chat.

### 4.12 Routines / heartbeats (v0.6)

Per-project scheduled tasks. The daemon ticks every 5s and fires whatever's due in any registered project (overlap-guarded).

| Method | Path | Purpose |
|---|---|---|
| `GET`    | `/projects/:pid/routines` | List |
| `POST`   | `/projects/:pid/routines` | `{ name, kind, schedule, spec, enabled }` |
| `GET`    | `/projects/:pid/routines/:name` | Detail |
| `DELETE` | `/projects/:pid/routines/:name` | Remove |
| `POST`   | `/projects/:pid/routines/:name/enable` | Enable |
| `POST`   | `/projects/:pid/routines/:name/disable` | Disable |
| `POST`   | `/projects/:pid/routines/:name/run` | Manual fire (ignores schedule) |

Schedule formats v0.6: `every:60s`, `every:5m`, `every:1h`, `every:1d`, `once:<iso-8601>` (auto-disables after firing). Cron syntax reserved for v0.7.

Kinds: `heartbeat` (logs to messages), `exec_agent` (calls an agent's engine), `telegram` (sends via the bridge), `shell` (sh -c with timeout).

### 4.13 Telegram (bidirectional, multi-channel, plugin)

Telegram is a plugin (since v0.5). Single-channel (legacy) and multi-channel modes both work:

```jsonc
// Multi-channel — N bots, each pinned to a project + agent
"telegram": {
  "enabled": true,
  "respond_with_engine": true,
  "channels": [
    { "name": "support", "bot_token": "...", "chat_id": "123",
      "route_to_agent": "sofia", "project": "/path/to/proj-A" },
    { "name": "sales",   "bot_token": "...", "chat_id": "456",
      "route_to_agent": "martin", "project": "/path/to/proj-B" }
  ]
}
```

```jsonc
// Single-channel — legacy / simple
"telegram": {
  "enabled": true,
  "bot_token": "...",     // or set BOT_TELEGRAM_TOKEN / TELEGRAM_BOT_TOKEN env
  "chat_id":   "...",     // or set TELEGRAM_CHAT_ID / BOT_TELEGRAM_CHAT_ID env
  "route_to_agent": "sofia"
}
```

| Method | Path | Purpose |
|---|---|---|
| `GET`  | `/telegram/status` | Per-channel polling state, route_to_agent, bot_token_source |
| `POST` | `/telegram/send` | `{ chat_id?, text, channel? }` — pick which bot sends |

**Routing per inbound message:**

1. Channel logs the message on `channel='telegram'` in the channel's target project.
2. **Typing indicator** starts (`sendChatAction action=typing` every 4s) so the human sees "escribiendo…" while the engine round-trip runs.
3. If `respond_with_engine` is true (default), it tries to reply:
   - If `route_to_agent` is set and that agent has a model → call its engine, reply.
   - Else if `super_agent.enabled` → run the **tool-using super-agent** (loops until final text or 6 iterations), reply.
   - Else just log, no reply.
4. Reply text is filtered through `stripThinking()` — `<think>…</think>` and `<thinking>…</thinking>` blocks are removed before the message goes to Telegram (they're noise to a chat reader). The full reasoning is preserved in the daemon log; the messages row records `meta.thinking_stripped: true` when applicable.
5. Outbound is logged on `channel='telegram'`, `direction='out'`.

Limitations v0.9:
- One-shot per inbound — no multi-turn context yet. Every message answered fresh.
- No `/commands` parser — every message hits the agent.

---

## 5. The killer pattern: `apx mcp run` from bash

Most MCP integrations require the IDE to spawn the MCP itself. That's annoying when:

- You want to call an MCP from a shell script
- An agent wants a tool that isn't registered in its IDE
- Several agents need the same tool with the same config

APX flips this around. The **project** owns the MCP registry. Any process — including a bash invocation from inside an agent — can call:

```bash
apx mcp run filesystem read_file '{"path":"./README.md"}'
```

Under the hood: the CLI POSTs to `/projects/:pid/mcps/filesystem/call`. The daemon spawns (or reuses) the MCP process, sends a JSON-RPC `tools/call`, and returns the result.

That means **agents don't need MCPs in their IDE config at all**. They just shell out via `apx`.

---

## 6. Telegram bidirectional

- **Outbound**: `POST /telegram/send`. Logged into `messages` with `direction='out'`.
- **Inbound**: long-polling on `getUpdates`. Each new message is logged with `direction='in'`. The daemon emits a webhook-style local event (in v0.1: just a row insert; in v0.2: SSE on `/events`) that an agent runner can subscribe to.

Polling stops automatically on `apx daemon stop`. State (`offset`) is persisted in `~/.apx/telegram-state.json` so restarts don't replay messages.

---

## 7. Failure modes

| Failure | Behavior |
|---|---|
| SQLite locked | Retry with backoff; surface to caller after 3s |
| MCP process crashes | Marked unhealthy in `/projects/:pid/mcps`; respawned on next `call` |
| Telegram 429 | Exponential backoff, capped at 60s |
| `AGENTS.md` invalid | Project marked degraded; `/agents` returns last good cache + warning |
| Port 7430 in use | Refuse to start; suggest `APX_PORT=7431 apx daemon start` |

---

## 8. What APX is not

- Not an agent runtime. It doesn't decide what tokens an LLM emits.
- Not a cloud service. Local only.
- Not a database server. Each project owns its SQLite.
- Not an authentication system. If you want auth, terminate the API behind a reverse proxy you control.
