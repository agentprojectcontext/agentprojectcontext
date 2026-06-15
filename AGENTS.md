# Agents

## Developer Agent
- **Role**: Software Developer
- **Description**: Assists with development, building, and fixing issues in the `apc` documentation site.

### Rules and Workflows

- **Build Validation**: Always run `npm run build` and ensure there are no compilation or type errors before declaring a task finished, pushing to `main`, or considering code ready. If the build fails, fix the errors before proceeding.

- **Multi-language docs are mirrored, not single-source**: This site uses folder-per-locale i18n (`src/pages/en/` and `src/pages/es/`). Both trees must stay structurally identical and semantically equivalent.
  - Any edit to a file under `src/pages/en/` MUST be replicated in the matching `src/pages/es/` file (and vice-versa). Same applies to `_meta.js` (translate the `title` field, keep keys identical).
  - When adding a new doc page, create it in BOTH `src/pages/en/<path>.mdx` and `src/pages/es/<path>.mdx`, and update BOTH `_meta.js` files for that directory.
  - When deleting a page, remove it from BOTH trees and BOTH `_meta.js` files.
  - Internal links inside `src/pages/en/**` must use `/en/...` prefixes. Internal links inside `src/pages/es/**` must use `/es/...` prefixes. Never cross-link across locales for the same content — link to the locale-matched URL.
  - For JSX components with user-visible text (e.g. `src/components/HomeBlocks.jsx`), text strings live in `src/i18n/strings.js` keyed by locale (`en`, `es`). When adding/changing visible text, update BOTH locale entries in `strings.js`. Components receive the locale via prop from their MDX caller (`<HomeHero locale="en" />` vs `locale="es"`).
  - The root `src/pages/index.mdx` is a redirect to `/en/` only — no translated content lives there.

- **Locale verification before closing a task**: After any docs change, confirm both locales render by running `npm run build` and checking that both `/en/...` and `/es/...` versions of the modified page are listed in the build output without errors.
