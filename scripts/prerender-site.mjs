import { createServer } from 'vite';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const templatePath = join(dist, 'index.html');
const template = readFileSync(templatePath, 'utf8');
const baseUrl = 'https://progeni.live';
const products = JSON.parse(
  readFileSync(join(root, 'src/registry/products.json'), 'utf8')
);
const categories = JSON.parse(
  readFileSync(join(root, 'src/registry/categories.json'), 'utf8')
);

const publicProducts = products.filter(
  (product) =>
    product.visibility === 'public' &&
    !['draft', 'deprecated', 'archived'].includes(product.status)
);
const publicCategories = categories.filter(
  (category) =>
    category.visibility === 'public' &&
    publicProducts.some((product) => product.categoryIds.includes(category.id))
);

const routes = [
  ['/', 'index.html'],
  ['/tools', 'tools.html'],
  ['/new', 'new.html'],
  ['/about', 'about.html'],
  ['/contact', 'contact.html'],
  ['/privacy', 'privacy.html'],
  ['/terms', 'terms.html'],
  ...publicProducts
    .filter((product) => product.seo?.indexable !== false)
    .map((product) => [
      `/tools/${product.slug}`,
      `tools/${product.slug}.html`,
    ]),
  ...publicCategories.map((category) => [
    `/categories/${category.slug}`,
    `categories/${category.slug}.html`,
  ]),
  ['/this-route-does-not-exist', '404.html'],
];

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function updateTag(html, selector, tag) {
  const match = /^(name|property)=(.+)$/.exec(selector);
  if (!match) throw new Error(`Unsupported metadata selector: ${selector}`);
  const [, attribute, value] = match;
  const expression = new RegExp(
    `<meta\\b(?=[^>]*\\b${attribute}=["']${escapeRegExp(value)}["'])[^>]*>`,
    'i'
  );
  if (expression.test(html)) return html.replace(expression, tag);
  return html.replace('</head>', `  ${tag}\n</head>`);
}

function renderTemplate(pageTemplate, data, route) {
  if (!data?.title || !data?.description || !data?.canonicalPath) {
    throw new Error(`Missing server-rendered SEO metadata for ${route}.`);
  }
  let html = pageTemplate.replace(
    /<title>[\s\S]*?<\/title>/i,
    `<title>${escapeHtml(data.title)}</title>`
  );
  if (!/<title>[\s\S]*?<\/title>/i.test(pageTemplate)) {
    throw new Error(`Could not find the document title element for ${route}.`);
  }

  const metaTags = [
    ['name=description', data.description],
    ['name=robots', data.robots || 'index,follow'],
    ['property=og:title', data.title],
    ['property=og:description', data.description],
    ['property=og:url', `${baseUrl}${data.canonicalPath}`],
    ['property=og:type', data.ogType || 'website'],
    ['property=og:site_name', 'Progeni'],
    ['name=twitter:title', data.title],
    ['name=twitter:description', data.description],
    ['name=twitter:url', `${baseUrl}${data.canonicalPath}`],
    ['name=twitter:card', 'summary_large_image'],
  ];

  for (const [selector, value] of metaTags) {
    const attribute = selector.startsWith('name=') ? 'name' : 'property';
    const name = selector.slice(attribute.length + 1);
    const tag = `<meta ${attribute}="${escapeHtml(name)}" content="${escapeHtml(value)}" />`;
    html = updateTag(html, selector, tag);
  }

  const canonical = `<link rel="canonical" href="${escapeHtml(`${baseUrl}${data.canonicalPath}`)}" />`;
  const canonicalExpression = /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i;
  if (canonicalExpression.test(html)) {
    html = html.replace(canonicalExpression, canonical);
  } else {
    html = html.replace('</head>', `  ${canonical}\n</head>`);
  }

  html = html.replace(
    /<script\b(?=[^>]*\btype=["']application\/ld\+json["'])[^>]*>[\s\S]*?<\/script>/gi,
    ''
  );
  if (data.jsonLd) {
    const safeJsonLd = String(data.jsonLd).replace(/</g, '\\u003c');
    html = html.replace(
      '</head>',
      `  <script id="progeni-jsonld" type="application/ld+json">${safeJsonLd}</script>\n</head>`
    );
  }

  const rootExpression = /<div id="root"><\/div>/;
  if (!rootExpression.test(html)) {
    throw new Error(`Could not find the empty React root in the template for ${route}.`);
  }
  return html.replace(rootExpression, `<div id="root">${data.body}</div>`);
}

const vite = await createServer({
  configFile: join(root, 'vite.config.ts'),
  appType: 'custom',
  server: { middlewareMode: true },
});

try {
  const { render } = await vite.ssrLoadModule('/src/entry-server.tsx');
  const { takeSsrSeo } = await vite.ssrLoadModule('/src/lib/seo.ts');
  const seenCanonicals = new Set();

  for (const [route, relativeFile] of routes) {
    const body = await render(route);
    const seo = takeSsrSeo();
    if (!body.trim()) throw new Error(`Server rendering returned no content for ${route}.`);
    const page = renderTemplate(template, { ...seo, body }, route);
    const canonical = `${baseUrl}${seo.canonicalPath}`;
    if (seenCanonicals.has(canonical)) {
      throw new Error(`Duplicate canonical URL generated: ${canonical}`);
    }
    seenCanonicals.add(canonical);

    const outputPath = join(dist, relativeFile);
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, page, 'utf8');
  }

  console.log(
    `Prerendered ${routes.length - 1} public routes and a 404 page (${publicCategories.length} categories).`
  );
} finally {
  await vite.close();
}
