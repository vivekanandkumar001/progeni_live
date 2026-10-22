import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from '../components/AppLink';
import { SearchX, LayoutGrid } from 'lucide-react';
import SearchBox from '../components/search/SearchBox';
import { ProductCard } from '../components/ProductCard';
import { searchCatalog } from '../lib/search';
import { getPublicCategories } from '../registry/selectors';
import { useSeo, useJsonLd } from '../lib/seo';

const ToolsPage: React.FC = () => {
  useSeo({
    title: 'All Tools — Free Browser-Based Utilities',
    description:
      'Browse every tool in the Progeni collection. Search or filter by category to find exactly what you need.',
    canonicalPath: '/tools',
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const categorySlug = searchParams.get('category') ?? 'all';

  const categories = getPublicCategories();

  const results = useMemo(
    () => searchCatalog(query, { categorySlug }),
    [query, categorySlug]
  );

  // ItemList: describes the catalogue as a list of individual tools so search
  // engines can understand the collection rather than one anonymous page.
  useJsonLd({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'All Progeni Tools',
    description:
      'Browse every tool in the Progeni collection. Search or filter by category to find exactly what you need.',
    url: 'https://progeni.live/tools',
    numberOfItems: results.length,
    itemListElement: results.map((result, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: result.product.name,
      url: `https://progeni.live/tools/${result.product.slug}`,
    })),
  });

  const setCategory = (slug: string) => {
    const next = new URLSearchParams(searchParams);
    if (slug === 'all') {
      next.delete('category');
    } else {
      next.set('category', slug);
    }
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="page-container py-12 sm:py-16">
      <header>
        <h1 className="section-title">All Tools</h1>
        <p className="section-subtitle">
          Everything in the Progeni collection, ready to use.
        </p>
      </header>

      {/* Search */}
      <div className="mt-8 max-w-2xl">
        <SearchBox submitPath="/tools" initialQuery={query} />
      </div>

      {/* Category filters */}
      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        <button
          type="button"
          onClick={() => setCategory('all')}
          aria-pressed={categorySlug === 'all'}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
            categorySlug === 'all'
              ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
              : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900'
          }`}
        >
          <LayoutGrid className="mr-1.5 inline h-3.5 w-3.5" aria-hidden="true" />
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setCategory(category.slug)}
            aria-pressed={categorySlug === category.slug}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              categorySlug === category.slug
                ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Results */}
      {results.length > 0 ? (
        <>
          <h2 className="sr-only">Search results</h2>
          <p className="mt-8 text-sm text-slate-600" aria-live="polite">
            {results.length} {results.length === 1 ? 'tool' : 'tools'}
            {query && (
              <>
                {' '}
                matching <span className="font-medium text-slate-900">&ldquo;{query}&rdquo;</span>
              </>
            )}
          </p>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((result) => (
              <ProductCard key={result.product.id} product={result.product} />
            ))}
          </div>
        </>
      ) : (
        <div className="mt-16 flex flex-col items-center text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <SearchX className="h-7 w-7" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-lg font-bold text-slate-900">
            No tools found
          </h2>
          <p className="mt-2 max-w-md text-sm text-slate-600">
            {query
              ? `We don’t have anything for “${query}”${categorySlug !== 'all' ? ' in this category' : ''} yet. Try another word, or browse everything.`
              : 'There are no tools in this category yet. Check back soon.'}
          </p>
          <div className="mt-6 flex gap-3">
            {(query || categorySlug !== 'all') && (
              <button
                type="button"
                onClick={() => setSearchParams({}, { replace: true })}
                className="btn-secondary"
              >
                Clear filters
              </button>
            )}
            <Link
              to="/tools"
              className="btn-primary"
              onClick={() => setSearchParams({}, { replace: true })}
            >
              Browse all tools
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolsPage;
