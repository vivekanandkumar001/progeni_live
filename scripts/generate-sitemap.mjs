/**
 * Generates public/sitemap.xml from the product registry.
 * Run: node scripts/generate-sitemap.mjs
 *
 * Only canonical, public, indexable pages are included:
 * - static routes
 * - public categories with at least one public product
 * - public, indexable products with absolute (subdomain/external) destinations
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const products = JSON.parse(readFileSync(join(root, 'src/registry/products.json'), 'utf-8'));
const categories = JSON.parse(readFileSync(join(root, 'src/registry/categories.json'), 'utf-8'));

const BASE = 'https://progeni.live';

const publicCategories = categories.filter((c) => c.visibility === 'public');
const publicProducts = products.filter(
  (p) => p.visibility === 'public' && p.status !== 'deprecated'
);

const urls = [];

// Static routes
urls.push(
  { loc: `${BASE}/`, priority: '1.0', changefreq: 'daily' },
  { loc: `${BASE}/tools`, priority: '0.9', changefreq: 'daily' },
  { loc: `${BASE}/new`, priority: '0.7', changefreq: 'weekly' },
  { loc: `${BASE}/about`, priority: '0.6', changefreq: 'monthly' },
  { loc: `${BASE}/contact`, priority: '0.5', changefreq: 'monthly' },
  { loc: `${BASE}/privacy`, priority: '0.4', changefreq: 'monthly' },
  { loc: `${BASE}/terms`, priority: '0.4', changefreq: 'monthly' }
);

// Categories that contain at least one public product
for (const category of publicCategories) {
  const hasProducts = publicProducts.some((p) => p.categoryIds.includes(category.id));
  if (!hasProducts) continue;
  urls.push({
    loc: `${BASE}/categories/${category.slug}`,
    priority: '0.8',
    changefreq: 'weekly',
  });
}

// Products: detail pages for integrated tools; subdomain products keep their
// own canonical metadata, so we list the ecosystem detail page anyway as it
// provides unique information (description, capabilities, links).
for (const product of publicProducts) {
  if (product.seo && product.seo.indexable === false) continue;
  urls.push({
    loc: `${BASE}/tools/${product.slug}`,
    priority: product.featured ? '0.85' : '0.7',
    changefreq: 'weekly',
  });
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

writeFileSync(join(root, 'public/sitemap.xml'), xml, 'utf-8');
console.log(`sitemap.xml generated with ${urls.length} URLs.`);
