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

const CREW_BLOBS = [
  {
    name: 'menta',
    src: '/images/apx-blobs/menta.webp',
    eyes: [
      { x: 121.9, y: 93.1, w: 16, h: 33.8, rx: 6.4 },
      { x: 151.9, y: 93.1, w: 16, h: 33.8, rx: 6.4 }
    ]
  },
  {
    name: 'aqua',
    src: '/images/apx-blobs/aqua.webp',
    eyes: [
      { x: 92.9, y: 105.8, w: 10.9, h: 20.3, rx: 4.4 },
      { x: 114.7, y: 105.8, w: 10.9, h: 20.3, rx: 4.4 }
    ]
  },
  {
    name: 'brasa',
    src: '/images/apx-blobs/brasa.webp',
    eyes: [
      { x: 94.8, y: 95.2, w: 16.9, h: 18.6, rx: 6.8 },
      { x: 126.3, y: 95.2, w: 16.9, h: 18.6, rx: 6.8 }
    ]
  }
]

function CrewBlob({ blob }) {
  return (
    <span className={`apc-blob apc-blob--${blob.name}`}>
      <img src={blob.src} alt="" width="256" height="256" draggable="false" />
      <svg viewBox="0 0 256 256" aria-hidden="true">
        {blob.eyes.map((eye) => (
          <rect
            key={`${eye.x}-${eye.y}`}
            x={eye.x}
            y={eye.y}
            width={eye.w}
            height={eye.h}
            rx={eye.rx}
            fill="#15181c"
          />
        ))}
      </svg>
    </span>
  )
}

export function HomeProductCallout({ locale = 'en' }) {
  const t = getStrings(locale).home.product
  return (
    <section className="apc-product-callout" aria-labelledby="apc-product-title">
      <div className="apc-product-copy">
        <div className="apc-kicker">{t.kicker}</div>
        <h2 id="apc-product-title">{t.title}</h2>
        <p>{t.body}</p>
      </div>
      <div className="apc-product-aside">
        <div className="apc-product-scene" aria-hidden="true">
          <span className="apc-product-orbit apc-product-orbit--one" />
          <span className="apc-product-orbit apc-product-orbit--two" />
          <div className="apc-product-blobs">
            {CREW_BLOBS.map((blob) => <CrewBlob key={blob.name} blob={blob} />)}
          </div>
          <div className="apc-crew-caption">{t.crew}</div>
        </div>
        <a className="apc-product-link" href="https://agentprojectcontext.github.io/apx/v2/">
          {t.link} <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>
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
