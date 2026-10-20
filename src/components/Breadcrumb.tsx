import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
        <li>
          <Link to="/" className="transition-colors hover:text-indigo-700">
            Home
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={index}>
              <li aria-hidden="true">
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </li>
              <li className="min-w-0">
                {item.path && !isLast ? (
                  <Link to={item.path} className="transition-colors hover:text-indigo-700">
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className="inline-block max-w-[220px] truncate font-medium text-slate-900 align-bottom sm:max-w-md"
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.label}
                  </span>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};
