import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Product } from '../registry/schemas';
import { IconRenderer } from './IconRenderer';
import { StatusBadge } from './Badge';
import { resolveDestination } from '../lib/destinations';

interface ProductCardProps {
  product: Product;
}

/**
 * A single service card. Everything shown here comes from the product
 * registry — nothing is hardcoded per product.
 */
export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const destination = resolveDestination(product);

  return (
    <div className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md">
      <div>
        {/* Icon, name & status */}
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600">
              <IconRenderer name={product.icon} className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-lg font-bold tracking-tight text-slate-900">
                {product.name}
              </h3>
              {product.featured && (
                <span className="mt-0.5 block text-xs font-medium text-indigo-600">
                  Featured
                </span>
              )}
            </div>
          </div>
          {product.status !== 'active' && <StatusBadge status={product.status} />}
        </div>

        <p className="mb-5 text-sm leading-relaxed text-slate-600">
          {product.shortDescription}
        </p>

        {/* A few things this service can do */}
        {product.capabilities.length > 0 && (
          <ul className="mb-5 space-y-1.5">
            {product.capabilities.slice(0, 3).map((capability) => (
              <li key={capability} className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500"
                  aria-hidden="true"
                />
                <span className="line-clamp-1">{capability}</span>
              </li>
            ))}
            {product.capabilities.length > 3 && (
              <li className="pl-6 text-sm font-medium text-indigo-600">
                +{product.capabilities.length - 3} more
              </li>
            )}
          </ul>
        )}
      </div>

      {/* Actions */}
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <Link
          to={`/tools/${product.slug}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 transition-colors hover:text-indigo-700"
        >
          Learn more
          <span className="sr-only"> about {product.name}</span>
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>

        {destination.isExternal ? (
          <a
            href={destination.url}
            target={destination.target}
            rel={destination.rel}
            aria-label={`Open ${product.name}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
          >
            Open
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        ) : (
          <Link
            to={destination.url}
            aria-label={`Open ${product.name}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
          >
            Open
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  );
};
