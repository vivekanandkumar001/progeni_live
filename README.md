# Progeni — The Universal Digital Services Ecosystem

Parent website for **[progeni.live](https://progeni.live)**: a product discovery
engine and ecosystem shell that hosts, discovers, and connects a growing
collection of digital services.

> **One Platform. Many Possibilities.**

## What this is

A static-first React application that renders a homepage, a universal service
directory, category pages, and product detail pages — all driven by a
**validated product registry**, not hardcoded components. Products like
[Progeni Bench](https://bench.progeni.live) and
[WaKit](https://wakit.progeni.live) remain fully independent applications on
their own subdomains; this site links to them.

## Tech stack

- React 18 + TypeScript + Vite
- Tailwind CSS (light-only design system — the site ships one light theme)
- React Router v6 (client-side routing)
- Zod (registry validation)
- Vitest + React Testing Library (110 tests)
- Lucide icons (explicitly imported to keep the bundle tree-shaken)

## Quick start

```bash
npm install
npm run dev        # dev server
npm test           # run all tests
npm run build      # validate sitemap + typecheck + production build
npm run preview    # serve the production build locally
npm run sitemap    # regenerate public/sitemap.xml from the registry
npm run validate   # registry validation only
```

## Architecture

```
src/
  registry/            # Data layer — the source of truth
    products.json      #   product records (validated by Zod)
    categories.json    #   category records
    schemas.ts         #   Zod schemas + exported types
    validation.ts      #   cross-record validation (unique ids/slugs, refs, URLs)
    selectors.ts       #   public-facing queries (visibility/status filtering)
  lib/
    search.ts          # ranked keyword search (behind a swappable interface)
    destinations.ts    # safe destination resolution (scheme checks, fallbacks)
    seo.ts             # per-route meta title/description/canonical/OG + JSON-LD
    dates.ts           # timezone-stable calendar date formatting
  components/
    layout/            # Header (responsive nav), Footer, Layout
    search/SearchBox.tsx  # universal search with suggestions + keyboard nav
    ProductCard.tsx    # registry-driven product card
    CategoryCard.tsx   # registry-driven category card
    Badge.tsx          # status badges (active/beta/development/…)
  pages/               # Route components (/, /tools, /tools/:slug,
                       # /categories/:slug, /new, /about, /contact,
                       # /privacy, /terms, *)
  test/                # Vitest suites (registry, search, selectors, UI, SEO)
scripts/
  generate-sitemap.mjs # sitemap generated from the registry on every build
public/                # favicon, robots.txt, og-image.jpg, generated sitemap.xml
```

**Separation of concerns:** product data, validation, search, destination
resolution, and UI are decoupled. The homepage never hardcodes a product; every
section reads from the registry.

## Adding a new product

1. Add a record to `src/registry/products.json`:

```jsonc
{
  "id": "prod-example",              // unique, stable
  "slug": "example",                 // kebab-case, unique
  "name": "Example",
  "shortDescription": "At least 10 characters describing what it does.",
  "description": "Optional longer description (plain text).",
  "categoryIds": ["cat-media"],      // must exist in categories.json
  "tags": ["searchable", "terms"],
  "capabilities": ["Verified capability list"],
  "status": "active",                // development | beta | active | maintenance | deprecated
  "visibility": "public",            // public | unlisted | private
  "hosting": "standalone",           // standalone | integrated
  "destination": {
    "type": "subdomain",             // subdomain | path | external
    "url": "https://example.progeni.live/"
  },
  "supportUrl": "https://example.progeni.live/contact", // optional; omit if the
                                                         // product has no contact
                                                         // page (the /contact page
                                                         // then falls back to email)
  "icon": "Wrench",                  // must be in the icon allow-list
  "featured": true,
  "sortOrder": 10,
  "seo": { "title": "...", "description": "...", "indexable": true },
  "createdAt": "2026-10-21T00:00:00Z",
  "updatedAt": "2026-10-21T00:00:00Z"
}
```

2. If a new category is needed, add it to `src/registry/categories.json`.
3. If a new icon is needed, add it to the allow-list in
   `src/components/IconRenderer.tsx`.
4. Run `npm run validate && npm test && npm run build`.

The homepage, `/tools` directory, category pages, search, and the sitemap all
update automatically. **No homepage edits are ever required.**

### Visibility rules (enforced in `selectors.ts`)

| Visibility  | Directory/Search | Direct link | Sitemap |
|-------------|------------------|-------------|---------|
| `public`    | yes              | yes         | yes (if `seo.indexable`) |
| `unlisted`  | no               | yes         | no      |
| `private`   | no               | never       | no      |

Deprecated products are excluded from public listings. Unlisted/private
products are never shipped in public catalog payloads beyond their own detail
route resolution (private ones are never resolvable at all).

## Deployment

Static build → any static host (Netlify, Vercel, Cloudflare Pages, GitHub
Pages, etc.):

1. `npm run build` (also regenerates the sitemap).
2. Publish the `dist/` directory.
3. SPA fallback: all routes must rewrite to `index.html` (all major hosts
   support this via a `_redirects` file, `vercel.json`, or equivalent).
   This repo ships `vercel.json` with the rewrite — without it every
   client-side route returns 404 on Vercel.
4. Bind the `progeni.live` apex and `www` — **do not touch the existing
   `bench.progeni.live` or `wakit.progeni.live` DNS records.**
   Note: `www.progeni.live` currently has no DNS record; either add one that
   redirects to the apex, or drop `www` from the "must bind" list so the
   two hostnames are not competing for the same content.

### Rollback

- The site is fully static and version-controlled; redeploy the previous
  commit's `dist/` build to roll back.
- No database, no shared state, no DNS changes are required for site updates.

## SEO notes

- Unique title/description/canonical per route (set client-side in `seo.ts`;
  `index.html` carries homepage defaults for crawlers that do not execute JS).
  The homepage description in `index.html` and in `HomePage.tsx` must stay
  byte-identical — social scrapers read the static one, Google reads the
  rendered one.
- `seo.ts` writes tags in a `useLayoutEffect`, not `useEffect`. Passive
  effects are deferred until after paint, which leaves a window where the
  `<head>` still holds the previous route's title and canonical.
- JSON-LD structured data is emitted per route: `WebSite` + `SearchAction` on
  the homepage, `ItemList` on `/tools`, `WebApplication` + `BreadcrumbList` on
  tool pages, and `CollectionPage` + `BreadcrumbList` on category pages.
- Soft-404 protection: 404 routes, missing products, missing categories and
  empty categories emit `robots: noindex,follow` and a self-referencing
  canonical, so they are never indexed as duplicates of a live page.
- `public/sitemap.xml` is generated from the registry on every build —
  private, unlisted, deprecated, and `indexable: false` products never appear.
  Every URL carries a `<lastmod>` date.
- `public/robots.txt` disallows `/admin` and references the sitemap.
- Standalone products keep their own canonical URLs on their subdomains.
- `public/og-image.jpg` is a real 1200×630 JPEG. SVG social preview images
  render blank in most scrapers.

## Security notes

- Destination URLs are Zod-validated; only `http(s)` is accepted, and
  `resolveDestination` falls back to the internal detail page for any
  malformed or non-http(s) URL (`javascript:` etc.).
- Product descriptions are rendered as plain text, never raw HTML.
- External links use `rel="noopener noreferrer"`.
- No user accounts, no data collection, no third-party trackers on the parent
  site. No admin panel is exposed.

## Known limitations / future work

- Search is client-side (appropriate for the current catalog size) but is
  isolated behind `searchCatalog()` so a dedicated index can replace it later.
  Live suggestions require at least two characters — a single letter matches
  nearly every description and produces a useless dropdown.
- SEO metadata is applied client-side; a prerender/SSG pass (e.g. vite-ssg)
  would improve crawl fidelity for JS-executing crawlers. `index.html` already
  carries correct homepage metadata as a baseline.
- Fonts are loaded from Google Fonts, which is a third-party request that
  exposes the visitor's IP address to Google. Self-hosting the two families
  would remove it; the privacy policy discloses it in the meantime.
- Per-product contact pages are linked through the optional `supportUrl`
  field; products without one fall back to `mailto:support@progeni.live`.
  Do not link `{product}/contact` unless that route actually exists.
- No ESLint config is present yet (`tsc` + tests cover correctness today).
- The `/admin` route mentioned in the roadmap is intentionally not implemented
  (never ship an unsecured admin panel).
