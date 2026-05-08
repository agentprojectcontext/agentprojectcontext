import 'nextra-theme-docs/style.css'
import '../styles/apc.css'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
