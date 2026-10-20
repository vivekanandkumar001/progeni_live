import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Category } from '../registry/schemas';
import { IconRenderer } from './IconRenderer';

interface CategoryCardProps {
  category: Category & { count?: number };
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <Link
      to={`/categories/${category.slug}`}
      className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md"
    >
      <div>
        <div className="mb-4 flex items-center justify-between">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600">
            <IconRenderer name={category.icon} className="h-6 w-6" />
          </span>
          {typeof category.count === 'number' && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              {category.count} {category.count === 1 ? 'tool' : 'tools'}
            </span>
          )}
        </div>

        <h3 className="mb-2 text-base font-bold tracking-tight text-slate-900">
          {category.name}
        </h3>

        <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">
          {category.description}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-medium text-indigo-600">
        <span>Browse tools</span>
        <ChevronRight
          className="h-4 w-4 transition-transform group-hover:translate-x-1"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
};
