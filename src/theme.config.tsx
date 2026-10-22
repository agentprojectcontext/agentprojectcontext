import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import type { DocsThemeConfig } from 'nextra-theme-docs'
import { ThemeSwitch } from 'nextra-theme-docs'

const repositoryUrl =
  process.env.NEXT_PUBLIC_GITHUB_REPO || 'https://github.com/agentprojectcontext/agentprojectcontext'

const apxRepositoryUrl =
  process.env.NEXT_PUBLIC_APX_REPO || 'https://github.com/agentprojectcontext/apx'

const docsRepositoryBase =
  process.env.NEXT_PUBLIC_DOCS_REPO_BASE || `${repositoryUrl}/tree/main/src/pages`

const LOCALES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' }
] as const

function detectLocale(path: string): 'en' | 'es' {
  if (!path) return 'en'
  const first = path.split('/').filter(Boolean)[0]
  return first === 'es' ? 'es' : 'en'
}

function CodeLocaleSwitch() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)
  const current = detectLocale(router.asPath)

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  function switchTo(next: 'en' | 'es') {
    if (next === current) {
      setOpen(false)
      return
    }
    const path = router.asPath
    const swapped =
      path === `/${current}` || path === `/${current}/`
        ? `/${next}/`
        : path.startsWith(`/${current}/`)
        ? path.replace(`/${current}/`, `/${next}/`)
        : `/${next}/`
    router.push(swapped)
    setOpen(false)
  }

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title="Change language"
        aria-haspopup="listbox"
        aria-expanded={open}
        className="_h-7 _rounded-md _px-2 _text-xs _font-medium _transition-colors _text-gray-600 dark:_text-gray-400 hover:_bg-black/5 dark:hover:_bg-white/10"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
      >
        <svg viewBox="2 2 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z"
          />
        </svg>
        <span style={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
          {current}
        </span>
      </button>
      {open && (
        <ul
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.35rem)',
            right: 0,
            minWidth: '8.5rem',
            margin: 0,
            padding: '0.25rem',
            listStyle: 'none',
            border: '1px solid color-mix(in srgb, currentColor 14%, transparent)',
            borderRadius: '0.5rem',
            boxShadow: '0 10px 28px rgba(0,0,0,0.18)',
            fontSize: '0.85rem',
            zIndex: 50
          }}
          className="apc-locale-pop"
        >
          {LOCALES.map((l) => {
            const active = l.code === current
            return (
              <li key={l.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => switchTo(l.code)}
                  style={{
                    display: 'flex',
                    width: '100%',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.45rem 0.6rem',
                    background: 'transparent',
                    border: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                    borderRadius: '0.35rem',
                    textAlign: 'left',
                    fontWeight: active ? 600 : 400
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'color-mix(in srgb, currentColor 8%, transparent)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <span>{l.name}</span>
                  {active && (
                    <span aria-hidden="true" style={{ opacity: 0.7 }}>
                      ✓
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function NavbarExtra() {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
      <CodeLocaleSwitch />
      <ThemeSwitch lite />
      <span
        aria-hidden="true"
        style={{
          display: 'inline-block',
          width: '1px',
          height: '18px',
          background: 'currentColor',
          opacity: 0.2,
          margin: '0 0.4rem'
        }}
      />
      <a
        href={process.env.NEXT_PUBLIC_GITHUB_REPO || 'https://github.com/agentprojectcontext/agentprojectcontext'}
        target="_blank"
        rel="noreferrer"
        aria-label="GitHub repository"
        title="GitHub"
        className="nextra-focus _text-gray-600 dark:_text-gray-400 hover:_text-current"
        style={{ display: 'inline-flex', alignItems: 'center', padding: '0.25rem' }}
      >
        <svg width="22" height="22" fill="currentColor" viewBox="3 3 18 18" aria-hidden="true">
          <path d="M12 3C7.0275 3 3 7.12937 3 12.2276C3 16.3109 5.57625 19.7597 9.15374 20.9824C9.60374 21.0631 9.77249 20.7863 9.77249 20.5441C9.77249 20.3249 9.76125 19.5982 9.76125 18.8254C7.5 19.2522 6.915 18.2602 6.735 17.7412C6.63375 17.4759 6.19499 16.6569 5.8125 16.4378C5.4975 16.2647 5.0475 15.838 5.80124 15.8264C6.51 15.8149 7.01625 16.4954 7.18499 16.7723C7.99499 18.1679 9.28875 17.7758 9.80625 17.5335C9.885 16.9337 10.1212 16.53 10.38 16.2993C8.3775 16.0687 6.285 15.2728 6.285 11.7432C6.285 10.7397 6.63375 9.9092 7.20749 9.26326C7.1175 9.03257 6.8025 8.08674 7.2975 6.81794C7.2975 6.81794 8.05125 6.57571 9.77249 7.76377C10.4925 7.55615 11.2575 7.45234 12.0225 7.45234C12.7875 7.45234 13.5525 7.55615 14.2725 7.76377C15.9937 6.56418 16.7475 6.81794 16.7475 6.81794C17.2424 8.08674 16.9275 9.03257 16.8375 9.26326C17.4113 9.9092 17.76 10.7281 17.76 11.7432C17.76 15.2843 15.6563 16.0687 13.6537 16.2993C13.98 16.5877 14.2613 17.1414 14.2613 18.0065C14.2613 19.2407 14.25 20.2326 14.25 20.5441C14.25 20.7863 14.4188 21.0746 14.8688 20.9824C16.6554 20.364 18.2079 19.1866 19.3078 17.6162C20.4077 16.0457 20.9995 14.1611 21 12.2276C21 7.12937 16.9725 3 12 3Z" />
        </svg>
      </a>
    </div>
  )
}

function Footer() {
  const { locale } = useRouter()
  const isEs = locale === 'es'
  const labels = {
    project: isEs ? 'Proyecto' : 'Project',
    resources: isEs ? 'Recursos' : 'Resources',
    docs: isEs ? 'Documentación' : 'Documentation',
    spec: isEs ? 'Especificación' : 'Specification',
    examples: isEs ? 'Ejemplos' : 'Examples',
    apxRuntime: isEs ? 'APX (runtime)' : 'APX (runtime)',
    apcRepo: isEs ? 'Repositorio APC' : 'APC repository',
    apxRepo: isEs ? 'Repositorio APX' : 'APX repository',
    tagline: isEs
      ? 'Convención .apc/ para contexto de proyecto compartido entre agentes IA.'
      : 'The .apc/ convention for project context shared across AI agents.'
  }
  const docsHref = `/${locale ?? 'en'}/docs`
  const apxRefHref = `/${locale ?? 'en'}/docs/reference/apx`
  const linkStyle: React.CSSProperties = {
    fontSize: '0.8rem',
    fontWeight: 400,
    opacity: 0.78,
    textDecoration: 'none'
  }
  const headingStyle: React.CSSProperties = {
    fontSize: '0.7rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    opacity: 0.55,
    marginBottom: '0.65rem'
  }
  const colStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.45rem'
  }
  return (
    <div style={{ width: '100%', maxWidth: '72rem', margin: '0 auto' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.6fr) repeat(2, minmax(0, 1fr))',
          gap: '2.5rem',
          paddingBottom: '1.75rem'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxWidth: '22rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <img src="/favicon.svg" alt="" aria-hidden="true" style={{ height: '1.1rem', width: '1.1rem' }} />
            <span style={{ fontWeight: 600, fontSize: '0.85rem', letterSpacing: '-0.01em' }}>
              Agent Project Context
            </span>
          </span>
          <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 300, lineHeight: 1.55, opacity: 0.65 }}>
            {labels.tagline}
          </p>
        </div>

        <div style={colStyle}>
          <span style={headingStyle}>{labels.project}</span>
          <a href={docsHref} style={linkStyle}>{labels.docs}</a>
          <a href={`${docsHref}/specification/folder-structure`} style={linkStyle}>{labels.spec}</a>
          <a href={`${docsHref}/examples/minimal-apc`} style={linkStyle}>{labels.examples}</a>
          <a href={apxRefHref} style={linkStyle}>{labels.apxRuntime}</a>
        </div>

        <div style={colStyle}>
          <span style={headingStyle}>{labels.resources}</span>
          <a href={repositoryUrl} target="_blank" rel="noreferrer" style={linkStyle}>
            {labels.apcRepo} ↗
          </a>
          <a href={apxRepositoryUrl} target="_blank" rel="noreferrer" style={linkStyle}>
            {labels.apxRepo} ↗
          </a>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid color-mix(in srgb, currentColor 12%, transparent)',
          fontSize: '0.72rem',
          fontWeight: 300,
          opacity: 0.6
        }}
      >
        <span>MIT · {new Date().getFullYear()} © APC</span>
        <span>
          <a href={repositoryUrl} target="_blank" rel="noreferrer" style={{ ...linkStyle, fontSize: '0.72rem' }}>
            GitHub
          </a>
          {' · '}
          <a href={apxRepositoryUrl} target="_blank" rel="noreferrer" style={{ ...linkStyle, fontSize: '0.72rem' }}>
            APX
          </a>
          {' · '}
          <a href="/privacy/" style={{ ...linkStyle, fontSize: '0.72rem' }}>
            {isEs ? 'Privacidad' : 'Privacy'}
          </a>
          {' · '}
          <a href="/terms/" style={{ ...linkStyle, fontSize: '0.72rem' }}>
            {isEs ? 'Términos' : 'Terms'}
          </a>
        </span>
      </div>
    </div>
  )
}

const config: DocsThemeConfig = {
  i18n: [
    { locale: 'en', name: 'English' },
    { locale: 'es', name: 'Español' }
  ],
  logo: (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55rem' }}>
      <img src="/favicon.svg" alt="" aria-hidden="true" style={{ height: '1.75rem', width: '1.75rem' }} />
      <span style={{ fontWeight: 600, fontSize: '0.95rem', letterSpacing: '-0.01em' }}>
        Agent Project Context
      </span>
    </span>
  ),
  docsRepositoryBase,
  darkMode: true,
  nextThemes: {
    defaultTheme: 'system'
  },
  navbar: {
    extraContent: <NavbarExtra />
  },

  head: () => (
    <>
      <title>Agent Project Context</title>
      <meta
        name="description"
        content="APC is a standardized .apc/ folder convention for storing project-level context for AI agents, IDEs, and developer tools."
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
    content: <Footer />
  }
}

export default config
