export function HomeHero() {
  return (
    <div className="apc-hero">
      <div className="apc-eyebrow">Standardized project context for agents</div>
      <h1>One project. One context layer.</h1>
      <p className="apc-lead">
        APC defines a neutral, repository-owned way to store agent-readable project context in a
        canonical <code>.apc/</code> folder. It is designed for AI agents, editors, CLIs, and
        developer tooling that need a shared understanding of a project.
      </p>
    </div>
  )
}

export function HomeGrid() {
  return (
    <div className="apc-grid">
      <div className="apc-card">
        <div className="apc-kicker">Concept</div>
        <h3>Portable by default</h3>
        <p>
          APC keeps durable context in the repository instead of scattering it across tool-specific
          folders and private runtime state.
        </p>
      </div>
      <div className="apc-card">
        <div className="apc-kicker">Scope</div>
        <h3>Project-level context</h3>
        <p>
          APC covers metadata, agent definitions, skills, memory, and related project conventions. It
          does not define runtime execution.
        </p>
      </div>
      <div className="apc-card">
        <div className="apc-kicker">Interop</div>
        <h3>Compatible with MCP</h3>
        <p>
          APC and MCP solve different layers. APC standardizes project context. MCP connects agents to
          external tools and services.
        </p>
      </div>
    </div>
  )
}

export function HomePrinciples() {
  return (
    <ul className="apc-inline-list">
      <li>Portable</li>
      <li>Project-owned</li>
      <li>Human-readable</li>
      <li>Tool-neutral</li>
      <li>Filesystem-first</li>
    </ul>
  )
}

export function HomeNote() {
  return (
    <div className="apc-note">
      APC documentation in this site is intentionally protocol-oriented. It does not define a
      runtime, daemon, or vendor-specific workflow.
    </div>
  )
}
