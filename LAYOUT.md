# Layout architecture

## Purpose

The landing page is a reader-first entrance to Dulranga's academic notes. It
introduces the collection, provides full-text search, and groups subjects by
semester. The existing Fumadocs visual tokens and light/dark themes are reused.

## Structural hierarchy

```text
RootProvider (existing search and theme providers)
└── AppShell — minimum 100dvh, natural document scroll
    ├── Skip-to-content link
    ├── Sticky header
    │   └── PageContainer → site identity / search / theme controls
    ├── Main
    │   └── PageContainer (query container)
    │       ├── SectionWrapper → introduction / search / library anchor
    │       └── SectionWrapper → library heading and live totals
    │           └── Semester disclosures
    │               └── Query container → SubjectGrid → subject links
    └── Footer
        └── PageContainer → site credit / repository link
```

## Reusable components

- `src/components/layout/app-shell.tsx`: page frame, sticky navigation, skip
  link, main landmark, and footer. Used by the home route group.
- `src/components/layout/page-container.tsx`:
  - `PageContainer`: centered `max-w-6xl` boundary and query container.
  - `SectionWrapper`: fluid vertical section spacing and anchor scroll offset.
  - `SubjectGrid`: semantic list with container-driven column reflow.
- `src/lib/library.ts`: derives semester groups, subject entry links, and
  unique published note counts from the Fumadocs page tree.

## Container boundaries and breakouts

Header and footer backgrounds and dividing borders span the viewport; their
contents align with the main page through the shared `PageContainer`.
Content is capped at Tailwind's `max-w-6xl` (72rem). Side gutters scale from
`--spacing(5)` to `--spacing(10)` with `clamp()` and viewport width. This is
the only viewport-based spacing decision; inner layouts use their containers.

The introduction's heading is limited to `max-w-3xl`, explanatory copy to
`max-w-xl`, and search to `max-w-sm`. Text and cards wrap naturally.
Any future full-width section should sit outside the main `PageContainer`
and contain its own aligned inner `PageContainer`; avoid negative-margin
breakouts that can introduce horizontal scrolling.

## Responsive grid and rhythm

- Subject lists have one column by default, two at container `@xl` (36rem),
  and three at `@4xl` (56rem). Their nearest container is inside the semester
  panel, so padding is accounted for before changing column count.
- Grid gaps scale continuously from `--spacing(3)` to `--spacing(5)` using
  `clamp()` and `cqi`. Section rhythm scales from `--spacing(8)` to
  `--spacing(14)`. Panel/card padding uses the same fluid approach.
- Hero search and its browse link stack in narrow containers and align
  horizontally at `@xl`. Heading size also scales with container width.
- Cards stretch to the row height, with note counts aligned at their bottom
  edge. All content remains in source order; no masonry or visual reordering.
- Intro and library are separated by a full container-width border. Individual
  semester panels and cards provide local grouping boundaries.

## Scroll, disclosure, and overlay behavior

- One document scroll; no independently scrolling panes or scroll snapping.
- The compact header stays at `top-0`, `z-40`. Search and theme controls remain
  available on mobile without a navigation drawer.
- Shell minimum height is `100dvh`; sections have natural content height.
  The footer follows long content and stays at the bottom of short pages.
- The library anchor has `scroll-mt-24` to clear the sticky header.
- Native `details`/`summary` elements implement semester disclosures. The
  newest nonempty semester starts open; others start closed. Multiple groups
  can remain open. Native semantics provide keyboard operation without
  shipping custom accordion state.
- Both search buttons use the existing Fumadocs search dialog, including its
  keyboard shortcut, overlay, focus management, and results navigation.
- Links and controls have visible keyboard focus. A skip link targets the
  focusable main landmark. Decorative icons are hidden from assistive tools.
- Card transitions are color-only and disabled for reduced-motion users.

## Content rules

- Top-level vault folders become groups; `semester-N` folders are labeled
  `Semester N` and sorted numerically newest first.
- Child folders become subjects, with nested notes included in their count.
  A subject links to its index/overview note when present, otherwise its first
  note in sidebar order. Standalone published pages remain accessible as cards.
- Empty folders and external links are omitted. Duplicate page URLs within
  a subject/group are counted once. Top-level standalone notes appear in an
  `Other notes` group after the semester groups.
- No semester names, subject lists, counts, or note routes are hardcoded in
  the page. The page tree already applies the vault's publication exclusions.
- An empty collection gets an explanatory empty state and no browse anchor.
- Repository links use `gitConfig` from `src/lib/shared.ts`.

## Verification

Run `npm run types:check` and ESLint for changed application files. Check the
page at narrow, medium, and wide widths, including search, theme switching,
semester toggling, subject navigation, and keyboard focus. The repository-wide
lint command currently also traverses imported Obsidian plugin bundles under
the ignored vault directory; failures there are separate from application lint.
