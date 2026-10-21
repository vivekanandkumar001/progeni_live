import React from 'react';
import { Clock } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { getPublicProducts } from '../registry/selectors';
import { formatCalendarDate } from '../lib/dates';
import { useSeo } from '../lib/seo';

const NewPage: React.FC = () => {
  useSeo({
    title: 'What\u2019s New — The Latest Tools on Progeni',
    description:
      'The newest tools added to the Progeni collection, listed by launch date.',
    canonicalPath: '/new',
  });

  // Sorted by the real launch dates in the registry.
  const recent = getPublicProducts()
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="page-container py-12 sm:py-16">
      <header>
        <h1 className="section-title">What&rsquo;s New</h1>
        <p className="section-subtitle">
          The latest tools to join Progeni, newest first.
        </p>
      </header>

      {recent.length > 0 ? (
        <>
          <h2 className="sr-only">Recently added tools</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((product) => (
              <div key={product.id} className="flex flex-col gap-2">
                <ProductCard product={product} />
                <p className="flex items-center gap-1.5 px-1 text-xs text-slate-500">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  Added {formatCalendarDate(product.createdAt, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="mt-16 text-center">
          <p className="text-slate-600">
            Nothing new just yet. Check back soon.
          </p>
        </div>
      )}
    </div>
  );
};

export default NewPage;
