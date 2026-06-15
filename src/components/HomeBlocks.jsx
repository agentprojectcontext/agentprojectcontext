import { getStrings } from '../i18n/strings'

export function HomeHero({ locale = 'en' }) {
  const t = getStrings(locale).home
  return (
    <div className="apc-hero">
      <div className="apc-eyebrow">{t.eyebrow}</div>
      <h1>{t.title}</h1>
      <p className="apc-lead">
        {t.leadBefore}
        <code>.apc/</code>
        {t.leadAfter}
      </p>
    </div>
  )
}

export function HomeGrid({ locale = 'en' }) {
  const t = getStrings(locale).home.grid
  return (
    <div className="apc-grid">
      <div className="apc-card">
        <div className="apc-kicker">{t.portable.kicker}</div>
        <h3>{t.portable.title}</h3>
        <p>{t.portable.body}</p>
      </div>
      <div className="apc-card">
        <div className="apc-kicker">{t.scope.kicker}</div>
        <h3>{t.scope.title}</h3>
        <p>{t.scope.body}</p>
      </div>
      <div className="apc-card">
        <div className="apc-kicker">{t.interop.kicker}</div>
        <h3>{t.interop.title}</h3>
        <p>{t.interop.body}</p>
      </div>
    </div>
  )
}

export function HomePrinciples({ locale = 'en' }) {
  const items = getStrings(locale).home.principles
  return (
    <ul className="apc-inline-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

export function HomeNote({ locale = 'en' }) {
  const t = getStrings(locale).home
  return <div className="apc-note">{t.note}</div>
}
