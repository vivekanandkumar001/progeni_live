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
- Tailwind CSS (dark-first design system)
- React Router v6 (client-side routing)
- Zod (registry validation)
- Vitest + React Testing Library (77 tests)
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
    seo.ts             # per-route meta title/description/canonical/OG updates
  components/
    layout/            # Header (responsive nav), Footer, Layout
    search/SearchBox.tsx  # universal search with suggestions + keyboard nav
    ProductCard.tsx    # registry-driven product card
    CategoryCard.tsx   # registry-driven category card
    Badge.tsx          # status badges (active/beta/development/…)
  pages/               # Route components (/, /tools, /tools/:slug, …)
  test/                # Vitest suites (registry, search, selectors, UI)
scripts/
  generate-sitemap.mjs # sitemap generated from the registry on every build
public/                # favicon, robots.txt, generated sitemap.xml
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
4. Bind the `progeni.live` apex and `www` — **do not touch the existing
   `bench.progeni.live` or `wakit.progeni.live` DNS records.**

### Rollback

- The site is fully static and version-controlled; redeploy the previous
  commit's `dist/` build to roll back.
- No database, no shared state, no DNS changes are required for site updates.

## SEO notes

- Unique title/description/canonical per route (set client-side in `seo.ts`;
  `index.html` carries homepage defaults for crawlers that do not execute JS).
- `public/sitemap.xml` is generated from the registry on every build —
  private, unlisted, deprecated, and `indexable: false` products never appear.
- `public/robots.txt` disallows `/admin` and references the sitemap.
- Standalone products keep their own canonical URLs on their subdomains.

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
- SEO metadata is applied client-side; a prerender/SSG pass (e.g. vite-ssg)
  would improve crawl fidelity for JS-executing crawlers. `index.html` already
  carries correct homepage metadata as a baseline.
- Per-product contact pages are linked as `{product}/contact` by convention;
  verify each product actually exposes that route.
- No ESLint config is present yet (`tsc` + tests cover correctness today).
- The `/admin` route mentioned in the roadmap is intentionally not implemented
  (never ship an unsecured admin panel).
