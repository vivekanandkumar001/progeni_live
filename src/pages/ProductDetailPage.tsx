import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ExternalLink, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react';
import { getProductBySlug, getPublicCategories } from '../registry/selectors';
import { resolveDestination } from '../lib/destinations';
import { formatCalendarDate } from '../lib/dates';
import { IconRenderer } from '../components/IconRenderer';
import { StatusBadge } from '../components/Badge';
import { Breadcrumb } from '../components/Breadcrumb';
import { useSeo, useJsonLd } from '../lib/seo';
import NotFoundPage from './NotFoundPage';

const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const product = slug ? getProductBySlug(slug) : undefined;

  useSeo({
    title: product ? product.seo?.title || product.name : 'Tool Not Found',
    description:
      product?.seo?.description ||
      product?.shortDescription ||
      'This tool could not be found.',
    canonicalPath: product ? `/tools/${product.slug}` : `/tools/${slug ?? ''}`,
    // Missing tools must not be indexed or canonicalised onto a live page.
    robots: product ? 'index,follow' : 'noindex,follow',
  });

  // WebApplication + BreadcrumbList. The "browser based, free, no signup"
  // facts are properties of the Progeni tools themselves, so they are stated
  // as structured data rather than only in prose.
  //
  // NOTE: this hook must stay above the `if (!product)` early return below —
  // React requires the same hooks to run in the same order on every render.
  useJsonLd(
    product
      ? {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'WebApplication',
              '@id': `https://progeni.live/tools/${product.slug}#app`,
              name: product.name,
              url: `https://progeni.live/tools/${product.slug}`,
              description:
                product.seo?.description || product.shortDescription,
              applicationCategory: 'UtilitiesApplication',
              operatingSystem: 'Any',
              browserRequirements:
                'Requires a modern browser with JavaScript enabled.',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
              },
              isAccessibleForFree: true,
              featureList: product.capabilities,
              keywords: product.tags.join(', '),
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'All Tools',
                  item: 'https://progeni.live/tools',
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: product.name,
                  item: `https://progeni.live/tools/${product.slug}`,
                },
              ],
            },
          ],
        }
      : null
  );

  if (!product) {
    return (
      <NotFoundPage
        message={`We couldn’t find a tool called “${slug}”.`}
      />
    );
  }

  const destination = resolveDestination(product);
  const categories = product.categoryIds
    .map((id) => getPublicCategories().find((c) => c.id === id))
    .filter((cat): cat is NonNullable<typeof cat> => Boolean(cat));

  return (
    <div className="page-container py-12 sm:py-16">
      <Breadcrumb
        items={[{ label: 'All Tools', path: '/tools' }, { label: product.name }]}
      />

      <div className="grid gap-10 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2">
          <div className="flex items-start gap-5">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600">
              <IconRenderer name={product.icon} className="h-8 w-8" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                  {product.name}
                </h1>
                {product.status !== 'active' && <StatusBadge status={product.status} size="md" />}
              </div>
              <p className="mt-2 text-slate-600">{product.shortDescription}</p>
            </div>
          </div>

          {/* Category links */}
          {categories.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/categories/${cat.slug}`}
                  className="rounded-full border border-slate-300 bg-white px-3.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-indigo-400 hover:text-indigo-700"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          {/* About */}
          {product.description && (
            <section className="mt-10" aria-labelledby="about-tool">
              <h2 id="about-tool" className="text-lg font-bold text-slate-900">
                About {product.name}
              </h2>
              <p className="mt-3 leading-relaxed text-slate-600">{product.description}</p>
            </section>
          )}

          {/* What you can do */}
          {product.capabilities.length > 0 && (
            <section className="mt-10" aria-labelledby="capabilities">
              <h2 id="capabilities" className="text-lg font-bold text-slate-900">
                What you can do
              </h2>
              <ul className="mt-4 space-y-2.5">
                {product.capabilities.map((capability) => (
                  <li key={capability} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500"
                      aria-hidden="true"
                    />
                    {capability}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Related searches */}
          {product.tags.length > 0 && (
            <section className="mt-10" aria-labelledby="tags">
              <h2 id="tags" className="text-sm font-semibold text-slate-700">
                You might also search for
              </h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {product.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/tools?q=${encodeURIComponent(tag)}`}
                    className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600 transition-colors hover:border-indigo-300 hover:text-indigo-700"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {destination.isExternal ? (
              <a
                href={destination.url}
                target={destination.target}
                rel={destination.rel}
                className="btn-primary w-full"
              >
                Open {product.name}
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            ) : (
              <Link to={destination.url} className="btn-primary w-full">
                Open {product.name}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}

            <dl className="mt-6 space-y-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Availability</dt>
                <dd><StatusBadge status={product.status} /></dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Last updated</dt>
                <dd className="text-slate-700">
                  {formatCalendarDate(product.updatedAt)}
                </dd>
              </div>
            </dl>

            <p className="mt-6 rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-600">
              {product.name} works right in your browser — there is nothing to
              install.{' '}
              {destination.isExternal
                ? 'It opens in a new tab and stays free to use.'
                : 'It stays free to use.'}
            </p>
          </div>
        </aside>
      </div>

      <div className="mt-12 border-t border-slate-200 pt-6">
        <Link
          to="/tools"
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 transition-colors hover:text-indigo-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to all tools
        </Link>
      </div>
    </div>
  );
};

export default ProductDetailPage;
