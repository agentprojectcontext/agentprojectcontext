# my-first-project

Example APC project used as a reference fixture.

This directory shows the current repository layout:

- root `AGENTS.md`
- project context under `.apc/`
- per-agent memory files
- reusable skills
- MCP hints without secrets

## What's here

```text
.
├── AGENTS.md
├── .apc/
│   ├── project.json
│   ├── agents/
│   │   ├── sofia/
│   │   │   └── memory.md
│   │   └── martin/
│   │       └── memory.md
│   ├── skills/
│   │   ├── customer-support.md
│   │   ├── escalation.md
│   │   ├── pricing.md
│   │   └── sales-funnel.md
│   └── mcps.json
└── README.md
```

## Notes

- This example reflects the current implementation in this repository.
- Runtime artifacts, such as sessions, conversations, `project.db`, or message logs, are not APC portable-core content.
- APX stores runtime state under `~/.apx/projects/<project-id>/`; IDEs keep their own runtime state in their own local stores.
- The broader APC docs live in the repository root under [README](../../README.md) and [`docs/`](../../docs/).
