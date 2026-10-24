/**
 * Post-build prerender for progeni.live.
 *
 * The parent site is a client-rendered React app, so `dist/index.html` holds the
 * homepage title, description and canonical for every route. Crawlers that do
 * not execute JavaScript (social scrapers and most AI answer engines) therefore
 * saw the homepage metadata on all 14 URLs.
 *
 * This script loads each route from a local static server, records the DOM and
 * the head tags the app writes at runtime, and writes a static HTML file per
 * route with those exact tags. The SPA script tag is preserved, so a visitor
 * still gets the normal client-rendered app; React simply takes over the
 * prerendered markup.
 *
 * Both `route.html` and `route/index.html` are written because static hosts
 * disagree about which one an extensionless URL maps to. Both are the same
 * document and neither is added to the sitemap twice.
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('C:/Users/vivekanand/Desktop/Progeni/Utility/node_modules/playwright');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const ORIGIN = process.env.PRERENDER_ORIGIN || 'http://localhost:4100';
const PROD = 'https://progeni.live';

const products = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/registry/products.json'), 'utf8'));
const categories = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/registry/categories.json'), 'utf8'));

/** Every indexable route on the site. Kept in sync with src/routes.tsx. */
const ROUTES = [
  '/',
  '/tools',
  '/new',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  ...products.map((p) => `/tools/${p.slug}`),
  ...categories.map((c) => `/categories/${c.slug}`),
];

const escapeHtml = (value = '') =>
  String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function fileTargets(route) {
  if (route === '/') return [path.join(DIST, 'index.html')];
  const rel = route.replace(/^\//, '');
  return [path.join(DIST, `${rel}.html`), path.join(DIST, rel, 'index.html')];
}

const browser = (async () => {
  const instance = await chromium.launch();
  const page = await instance.newPage();
  let written = 0;
  let failed = 0;

  for (const route of ROUTES) {
    try {
      await page.goto(`${ORIGIN}${route}`, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(800);

      const data = await page.evaluate(() => {
        const attr = (selector, name = 'content') =>
          document.querySelector(selector)?.getAttribute(name) || '';
        return {
          title: document.title,
          description: attr('meta[name="description"]'),
          robots: attr('meta[name="robots"]'),
          canonical: attr('link[rel="canonical"]', 'href'),
          ogTitle: attr('meta[property="og:title"]'),
          ogDescription: attr('meta[property="og:description"]'),
          ogUrl: attr('meta[property="og:url"]'),
          ogImage: attr('meta[property="og:image"]'),
          twitterTitle: attr('meta[name="twitter:title"]'),
          twitterDescription: attr('meta[name="twitter:description"]'),
          twitterUrl: attr('meta[name="twitter:url"]'),
          jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')]
            .map((node) => node.textContent)
            .filter(Boolean),
          body: document.getElementById('root')?.innerHTML || '',
        };
      });

      let html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
      const canonical = data.canonical || `${PROD}${route === '/' ? '/' : route}`;

      html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(data.title)}</title>`);

      const setMeta = (name, content, attribute = 'name') => {
        if (!content) return;
        const selector = `meta[${attribute}="${name}"]`;
        const pattern = new RegExp(
          `<meta[^>]+${attribute}=["']${name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}["'][^>]*>`,
          'i',
        );
        const tag = `<meta ${attribute}="${name}" content="${escapeHtml(content)}" />`;
        html = pattern.test(html) ? html.replace(pattern, tag) : html.replace('</head>', `    ${tag}\n  </head>`);
      };

      setMeta('description', data.description);
      setMeta('robots', data.robots || 'index,follow');
      setMeta('og:title', data.ogTitle || data.title, 'property');
      setMeta('og:description', data.ogDescription || data.description, 'property');
      setMeta('og:url', data.ogUrl || canonical, 'property');
      setMeta('og:image', data.ogImage, 'property');
      setMeta('twitter:title', data.twitterTitle || data.title);
      setMeta('twitter:description', data.twitterDescription || data.description);
      setMeta('twitter:url', data.twitterUrl || canonical);

      const canonicalTag = `<link rel="canonical" href="${escapeHtml(canonical)}" />`;
      html = /<link[^>]+rel=["']canonical["'][^>]*>/i.test(html)
        ? html.replace(/<link[^>]+rel=["']canonical["'][^>]*>/i, canonicalTag)
        : html.replace('</head>', `    ${canonicalTag}\n  </head>`);

      // Replace the hand-written JSON-LD with exactly what the page produced.
      html = html.replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
      if (data.jsonLd.length) {
        const blocks = data.jsonLd
          .map((json) => `    <script type="application/ld+json">\n${json}\n    </script>`)
          .join('\n');
        html = html.replace('</head>', `${blocks}\n  </head>`);
      }

      html = html.replace(/<div id="root"><\/div>/, `<div id="root">${data.body}</div>`);

      for (const target of fileTargets(route)) {
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, html);
      }
      written += 1;
      console.log(`prerendered ${route}  (${data.title.slice(0, 60)})`);
    } catch (error) {
      failed += 1;
      console.log(`FAILED ${route}: ${error.message}`);
    }
  }

  await instance.close();
  console.log(`\n${written} routes prerendered, ${failed} failed`);
  if (failed) process.exitCode = 1;
})();
