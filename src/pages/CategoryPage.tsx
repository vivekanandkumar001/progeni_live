import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { Breadcrumb } from '../components/Breadcrumb';
import { IconRenderer } from '../components/IconRenderer';
import { getCategoryBySlug, getProductsByCategorySlug } from '../registry/selectors';
import { useSeo } from '../lib/seo';
import NotFoundPage from './NotFoundPage';

const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const category = slug ? getCategoryBySlug(slug) : undefined;

  useSeo({
    title: category ? `${category.name} — Progeni Tools` : 'Category Not Found',
    description: category?.description || 'This category could not be found.',
    canonicalPath: category ? `/categories/${category.slug}` : '/tools',
  });

  if (!category) {
    return <NotFoundPage message={`We couldn't find a category called “${slug}”.`} />;
  }

  const products = getProductsByCategorySlug(category.slug);

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
          <Link to="/tools" className="btn-secondary mt-6">
            Browse all tools
          </Link>
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
