import React from 'react';
import { useParams } from 'react-router-dom';
import { Link } from '../components/AppLink';
import { ArrowLeft } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { Breadcrumb } from '../components/Breadcrumb';
import { IconRenderer } from '../components/IconRenderer';
import { getCategoryBySlug, getProductsByCategorySlug } from '../registry/selectors';
import { useSeo, useJsonLd } from '../lib/seo';
import NotFoundPage from './NotFoundPage';

const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const category = slug ? getCategoryBySlug(slug) : undefined;
  const products = category ? getProductsByCategorySlug(category.slug) : [];

  useSeo({
    title: category ? `${category.name} — Progeni Tools` : 'Category Not Found',
    description: category?.description || 'This category could not be found.',
    canonicalPath: category ? `/categories/${category.slug}` : `/categories/${slug ?? ''}`,
    // Missing categories, and categories with no tools in them yet, must not
    // be indexed — an empty category page is thin content with nothing for a
    // visitor to do.
    robots: category && products.length > 0 ? 'index,follow' : 'noindex,follow',
  });

  // CollectionPage + BreadcrumbList. Kept above the early return below so the
  // hook order is identical for every render. An empty (noindex) category
  // gets no structured data, because it describes nothing.
  useJsonLd(
    category && products.length > 0
      ? {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'CollectionPage',
              name: `${category.name} — Progeni Tools`,
              description: category.description,
              url: `https://progeni.live/categories/${category.slug}`,
              isPartOf: {
                '@type': 'WebSite',
                name: 'Progeni',
                url: 'https://progeni.live/',
              },
              mainEntity: {
                '@type': 'ItemList',
                numberOfItems: products.length,
                itemListElement: products.map((product, index) => ({
                  '@type': 'ListItem',
                  position: index + 1,
                  name: product.name,
                  url: `https://progeni.live/tools/${product.slug}`,
                })),
              },
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
                  name: category.name,
                  item: `https://progeni.live/categories/${category.slug}`,
                },
              ],
            },
          ],
        }
      : null
  );

  if (!category) {
    return <NotFoundPage message={`We couldn’t find a category called “${slug}”.`} />;
  }

  return (
    <div className="page-container py-12 sm:py-16">
      <Breadcrumb
        items={[{ label: 'All Tools', path: '/tools' }, { label: category.name }]}
      />

      <header className="flex items-start gap-5">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600">
          <IconRenderer name={category.icon} className="h-7 w-7" />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {category.name}
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">{category.description}</p>
        </div>
      </header>

      {products.length > 0 ? (
        <>
          <h2 className="sr-only">Tools in {category.name}</h2>
          <p className="mt-8 text-sm text-slate-600" aria-live="polite">
            {products.length} {products.length === 1 ? 'tool' : 'tools'} available
          </p>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      ) : (
        <div className="mt-16 text-center">
          <p className="text-slate-600">
            There are no tools in this category yet. Check back soon.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/tools" className="btn-secondary">
              Browse all tools
            </Link>
            <Link to="/contact" className="btn-secondary">
              Suggest a tool
            </Link>
          </div>
        </div>
      )}

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

export default CategoryPage;
