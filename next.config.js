const withNextra = require('nextra').default({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx'
})

const isGithubActions = process.env.GITHUB_ACTIONS === 'true'
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] || ''
const isUserOrOrgPagesRepo = repoName.endsWith('.github.io')
const computedBasePath =
  process.env.NEXT_PUBLIC_BASE_PATH ||
  (isGithubActions && repoName && !isUserOrOrgPagesRepo ? `/${repoName}` : '')

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath: computedBasePath,
  assetPrefix: computedBasePath || undefined,
  exportPathMap: async (defaultPathMap) => {
    return Object.fromEntries(
      Object.entries(defaultPathMap).filter(([path]) => !path.endsWith('/_meta') && path !== '/_meta')
    )
  }
}

module.exports = withNextra(nextConfig)
