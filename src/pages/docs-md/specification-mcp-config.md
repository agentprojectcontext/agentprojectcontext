---
title: MCP Config
description: APC can include project-owned MCP configuration hints without replacing the MCP protocol itself.
---

# MCP Config

APC may include project-owned MCP configuration hints.

MCP itself is a protocol. APC does not implement the protocol. APC only gives the project a stable
place to say which MCP servers are expected or useful for this repository.

## Canonical file

```text
.apc/mcps.json
```

## Purpose

This file gives the project one local place to describe expected MCP servers in a shape compatible
tools can read.

It does **not** replace MCP. It complements MCP.

According to the official MCP architecture, an AI application acts as an MCP host, creates MCP
clients, and connects each client to an MCP server. Servers expose primitives such as tools,
resources, and prompts over transports such as `stdio` or Streamable HTTP. `.apc/mcps.json` is only
configuration input for that process.

## Example

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

## Allowed content

Use `.apc/mcps.json` for portable project expectations:

- server name
- command and non-secret arguments
- URL, when a remote MCP is part of the project contract
- environment variable names the user must provide locally
- enabled or disabled status, if a consumer supports it

Do not store:

- API keys
- access tokens
- OAuth refresh tokens
- personal account IDs
- private headers
- bearer tokens in `headers`
- credentials embedded in URLs or query strings
- generated session IDs
- machine-local absolute paths unless the path is intentionally part of the project contract

Use placeholders for secrets. The exact placeholder syntax may vary by consumer, but the repository
must contain only the reference, not the value.

Prefer this:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${env:GITHUB_TOKEN}"
      }
    }
  }
}
```

Do not commit this:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "ghp_real_token_here"
      }
    }
  }
}
```

Also do not commit this:

```json
{
  "mcpServers": {
    "private-api": {
      "url": "https://api.example.com/mcp?token=real_token_here",
      "headers": {
        "Authorization": "Bearer real_token_here"
      }
    }
  }
}
```

## Public repository safety

APC initializers and consumers should treat `.apc/mcps.json` as commit-safe only after validation:

- reject literal-looking secrets in `env`, `headers`, `url`, and `args`
- prefer `${env:NAME}` or another explicit environment placeholder
- keep local overrides in `.apc/mcps.local.json` or a runtime-owned config file
- ensure `.apc/.gitignore` ignores `*.local.json`, `*.secret.json`, `.env`, and `.env.*`
- run normal repository secret scanning before publishing

If a project needs a private remote MCP endpoint, `.apc/mcps.json` may name the endpoint and required
environment variables. Credentials remain in user-level runtime configuration, an environment
manager, or a managed secret store.

## Consumer behavior

APC consumers may:

- read `.apc/mcps.json`
- merge it with IDE-specific MCP files
- prefer APC entries when names conflict
- start the server process
- connect through MCP as a real MCP client
- expose discovered tools to the model

APC consumers should not:

- treat `.apc/mcps.json` as a transcript store
- mutate IDE-specific MCP files unless the user asked
- write secrets into `.apc/mcps.json`
- auto-commit `.apc/mcps.json` after adding a server without validating secret fields
- pretend APC is a substitute for MCP lifecycle, transport, or schema rules

## Why keep it in APC

Without a project-owned MCP hint file, teams often duplicate MCP setup across editor-specific
locations. Putting the project expectation in `.apc/mcps.json` reduces drift while preserving MCP
as the external tool protocol.

## References

- [MCP introduction](https://modelcontextprotocol.io/docs/getting-started/intro)
- [MCP architecture overview](https://modelcontextprotocol.io/docs/learn/architecture)
