import React from 'react'
import type { DocsThemeConfig } from 'nextra-theme-docs'

const repositoryUrl =
  process.env.NEXT_PUBLIC_GITHUB_REPO || 'https://github.com/your-org/apc'

const docsRepositoryBase =
  process.env.NEXT_PUBLIC_DOCS_REPO_BASE || `${repositoryUrl}/tree/main/pages`

const config: DocsThemeConfig = {
  logo: (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700 }}>
      <span
        aria-hidden="true"
        style={{
          display: 'inline-grid',
          placeItems: 'center',
          width: '1.8rem',
          height: '1.8rem',
          borderRadius: '0.6rem',
          background:
            'linear-gradient(135deg, rgba(32,118,255,0.16), rgba(12,184,139,0.22))',
          border: '1px solid rgba(32,118,255,0.2)'
        }}
      >
        APC
      </span>
      <span>Agent Project Context</span>
    </span>
  ),
  project: {
    link: repositoryUrl
  },
  docsRepositoryBase,
  darkMode: true,
  nextThemes: {
    defaultTheme: 'system'
  },
  head: () => (
    <>
      <meta
        name="description"
        content="APC, Agent Project Context, is a portable .apc/ folder standard for storing project-level context for AI agents, IDEs, and developer tools."
      />
      <meta
        name="keywords"
        content="APC, Agent Project Context, .apc, AI agents, developer tools, protocol, documentation"
      />
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    </>
  ),
  sidebar: {
    autoCollapse: true,
    defaultMenuCollapseLevel: 1
  },
  toc: {
    backToTop: 'Back to top'
  },
  editLink: {
    content: 'Edit this page on GitHub'
  },
  feedback: {
    content: 'Question or correction? Open a discussion.',
    labels: 'documentation'
  },
  footer: {
    content: <span>MIT {new Date().getFullYear()} © APC</span>
  }
}

export default config
