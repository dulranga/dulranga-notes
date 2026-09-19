# Project guidance

- Read [LAYOUT.md](./LAYOUT.md) before changing page structure or responsive
  behavior. It documents the approved reader-first landing page architecture.
- This is a Next.js App Router site using Tailwind CSS v4 and Fumadocs.
- Reuse existing Fumadocs theme tokens, search, and theme providers.
- Landing layout wrappers live in `src/components/layout/`. Prefer container
  queries for component reflow and fluid spacing derived from Tailwind's scale.
- Notes are supplied by a separate Obsidian vault. Derive library contents
  from `getSource()` and the published page tree, rather than hardcoding routes
  or editing imported vault content.
- See [README.md](./README.md) for the content pipeline and project commands.
- Verify application changes with `npm run types:check` and scoped ESLint.
  The full lint command also includes imported third-party Obsidian plugins.
