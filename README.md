# dulranga-notes

A forkable template that turns **any Obsidian vault repo** into a fast, searchable,
SEO-friendly documentation site. The actual notes live in a **separate repository**;
this repo only contains the site engine that pulls them in and renders them.

## What this is

This is the public template/site for [Dulranga](https://github.com/dulranga)'s
notes. The academic notes themselves are **not** stored here — they live in a
private Obsidian vault repo and are cloned in at build time (see
[Architecture](#architecture)).

The template is built on **Fumadocs** (
<https://fumadocs.dev>) — a Next.js/MDX documentation framework — plus:

- **Next.js** — app router, static generation, route handlers
- **fumadocs-obsidian** — renders raw Obsidian markdown (wikilinks, callouts,
  code blocks, math) into Fumadocs pages

## Quick start

```bash
npm install
cp .env.example .env    # set ACADEMIA_URL to your Obsidian vault repo
npm run dev             # http://localhost:3000
```

For a production build (clones the vault, copies media, then builds):

```bash
npm run build
npm start
```

## Forking & deploying your own vault

### 1. Fork this repo

Use GitHub's **"Use this template"** or regular fork. Since all vault content and
generated files (`content/academia`, `public/vault`, `.source`) are git-ignored,
your fork starts clean — only the engine and README are tracked.

### 2. Point it at your Obsidian repo

Set `ACADEMIA_URL` to a git URL of your vault. It must be git-clonable:

```bash
cp .env.example .env
# .env
ACADEMIA_URL=https://github.com/<you>/my-vault.git
```

For a **private** vault, allow the deploy provider to read it. The provider must
have git access — e.g. on Vercel add an SSH key or personal access token as an
environment secret and use an `https://<token>@github.com/...` or SSH URL. Test
locally with `npm run sync` before deploying.

> Because `npm run build` runs both sync scripts, the vault is cloned fresh and
> media copied on every production build.

### 3. Configure `src/lib/shared.ts`

This is the main config surface. It is consumed by the layouts, the header, the
Link to git history, and the OpenGraph image.

```ts
export const appName = "Dulranga's Notes";   // shown in header + OG image
export const docsRoute = "/docs";            // prefix for all note pages
export const docsImageRoute = "/og/docs";    // OpenGraph image route
export const docsContentRoute = "/llms.mdx/docs"; // raw-markdown content route

export const gitConfig = {
  user: "dulranga",      // GitHub username
  repo: "fumadocs",      // repo used for the header GitHub link
  branch: "main",        // branch the GitHub link points to
};
```

Where each is used:

| Field | Used by |
| ----- | ------- |
| `appName` | Header title (`src/lib/layout.shared.tsx`), OG image (`src/app/og/docs/[...slug]/route.tsx`) |
| `gitConfig.user/repo/branch` | Header GitHub link: `github.com/<user>/<repo>` |
| `docsRoute` / `docsContentRoute` / `docsImageRoute` | Route mapping and rewrites in `proxy.ts` |

Update `appName` to your name, and `gitConfig` so the header links to **your**
notes/site repo (not the engine fork). Leave `docsRoute`/`docsContentRoute`/
`docsImageRoute` as-is unless you deliberately change the URL structure.

### 4. Preview locally

```bash
npm install
npm run dev    # http://localhost:3000
```

Iterate on the UX if you like — the docs layout lives in `src/app/docs/layout.tsx`,
shared base options in `src/lib/layout.shared.tsx`.

### 5. Deploy

Any Next.js-compatible host works. Build requires git + a clone URL, so:

- **Vercel / Netlify / Cloudflare Pages** — one-click from the forked repo. Add
  `ACADEMIA_URL` (and any git auth secret) to the project's environment variables.
  The default `npm run build` already runs the sync scripts.
- **Self-host** — `npm run build && npm start` with `ACADEMIA_URL` set in the
  environment.

### Requirements & caveats

- The vault must be git-ignorable-clone friendly and **not** include `node_modules`.
- Vault paths are normalized into slugs (`Windows` → `windows`, spaces → `-`).
  Files named `Untitled.md`, `README.md`, and `LICENSE.md` are excluded, as is
  `.obsidian/` config and the `Excalidraw/` folder (see `src/lib/source.ts`).
- Media (images, PDFs, audio/video) is copied to `/vault/...` at build; keep it
  reasonably small to avoid slow builds.
- This template was generated with **Fumadocs** — a docs framework for
  Next.js/MDX. See <https://fumadocs.dev> for layout and theming APIs.

### Troubleshooting

- `[sync] ACADEMIA_URL env var is required` — the env var isn't set or the
  deploy host isn't passing it to the build.
- Build fails on clone — the host can't reach the vault repo; add git auth as
  an environment secret.
- Pages 404 — a top-level note is named `Untitled`/`README`/`LICENSE` (excluded),
  or it lives in a git-ignored path.

## Architecture

```
┌──────────────┐  ACADEMIA_URL   ┌─────────────────────┐
│ Vault repo   │ ──clone──────▶ │  content/academia/  │  (git-ignored)
│ (separate)   │                 └─────────┬───────────┘
└──────────────┘                           │
                                           ▼
                          ┌─────────────────────────────────┐
                          │        src/lib/source.ts        │
                          │  fumadocs-obsidian (fumadocs)   │
                          │  remark: GFM, math, mermaid     │
                          │  rehype: KaTeX, callouts        │
                          └───────────────┬─────────────────┘
                                          │
                     ┌────────────────────┼─────────────────────┐
                     ▼                    ▼                     ▼
        ┌────────────────────┐ ┌─────────────────────┐ ┌────────────────────┐
        │ /docs/[...slug]    │ │ /api/search         │ │ /llms.txt          │
        │ docs pages + TOC   │ │ full-text search    │ │ LLM-ready dump     │
        │ relative wikilinks │ │                     │ │ + /llms-full.txt   │
        └────────────────────┘ └─────────────────────┘ └────────────────────┘
```

### Pipeline

1. **`scripts/sync.mjs`** — shallow-clones the vault repo from `ACADEMIA_URL`
   into `content/academia/` and strips its `.git`. Runs on `build` and via
   `npm run sync`.
2. **`scripts/sync-vault.mjs`** — walks the vault and copies media
   (images, PDFs, audio/video, excalidraw) into `public/vault/`, exposing them
   at `/vault/...` at runtime.
3. **`src/lib/source.ts`** — the content adapter. Configures the `fumadocs-obsidian`
   vault source (which files to include, URL mapping), wires remark/rehype plugins
   (GFM, math + KaTeX, Mermaid, callouts), and normalizes file paths into slugs.
   In dev it spins up `vault.devServer()` for HMR.
4. **`src/app/docs/[...slug]/page.tsx`** — statically generates each note.
   Renders Obsidian components, keeps wiki-relative links working via
   `createRelativeLink`, and serves TOC + title via Fumadocs layout.
5. **`src/app/docs/page.tsx`** — redirects `/docs` to the first page in the tree.

### Content negotiation & LLM endpoints

- **`proxy.ts`** — serves raw markdown at `/docs/...md` and for
  `Accept: text/markdown` requests (per content negotiation), so the site
  doubles as a machine-readable mirror.
- **`src/app/llms.txt/route.ts`** & **`src/app/llms-full.txt/route.ts`** —
  emit `llms.txt`-style indexes and full plain-text dumps for feeding notes
  to LLMs.

### Search

- **`src/app/api/search/route.ts`** — Fumadocs `createFromSource` endpoint;
  the client-side search dialog in the layout queries it.

### Custom MDX components (`src/components/mdx.tsx`)

- **`Mermaid`** (`src/components/mdx/mermaid.tsx`) — lazy-loaded client-side
  diagram renderer with theme-aware dark mode.
- **`Callout`** — Fumadocs callouts, rendered from Obsidian callout syntax.

### Patches

- **`patches/fumadocs-obsidian+1.0.1.patch`** — applied via `patch-package`
  on `postinstall`; disables the internal callout resolver so callouts are
  handled by `rehype-callouts` instead.

## Key files

| File                                    | Purpose                                                     |
| --------------------------------------- | ----------------------------------------------------------- |
| `.env.example`                          | `ACADEMIA_URL` — git URL of your Obsidian vault repo        |
| `scripts/sync.mjs`                      | Clone the vault repo into `content/academia`                |
| `scripts/sync-vault.mjs`                | Copy vault media into `public/vault`                        |
| `src/lib/source.ts`                     | Content source: `fumadocs-obsidian` + remark/rehype plugins |
| `src/lib/shared.ts`                     | App name, routes, git config                                |
| `src/app/docs/[...slug]/page.tsx`       | Static note page renderer                                   |
| `proxy.ts`                              | Raw-markdown content negotiation                            |
| `patches/fumadocs-obsidian+1.0.1.patch` | postinstall patch for callouts                              |
