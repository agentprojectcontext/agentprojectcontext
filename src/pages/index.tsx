import Head from 'next/head'

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || ''

const REDIRECT_SCRIPT = `
(function(){
  var langs = navigator.languages || [navigator.language || 'en'];
  var target = '${BASE}/en/';
  for (var i = 0; i < langs.length; i++) {
    var code = (langs[i] || '').toLowerCase().split('-')[0];
    if (code === 'es') { target = '${BASE}/es/'; break; }
    if (code === 'en') { target = '${BASE}/en/'; break; }
  }
  window.location.replace(target);
})();
`.trim()

export default function RootRedirect() {
  return (
    <Head>
      <title>Agent Project Context</title>
      <meta httpEquiv="refresh" content={`0; url=${BASE}/en/`} />
      <script dangerouslySetInnerHTML={{ __html: REDIRECT_SCRIPT }} />
    </Head>
  )
}
