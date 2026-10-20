import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowRight } from 'lucide-react';
import { useSeo } from '../lib/seo';

interface NotFoundPageProps {
  message?: string;
}

const NotFoundPage: React.FC<NotFoundPageProps> = ({ message }) => {
  useSeo({
    title: 'Page Not Found',
    description: 'We could not find the page you were looking for.',
    canonicalPath: '/404',
  });

  return (
    <div className="page-container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
        <Compass className="h-7 w-7" aria-hidden="true" />
      </span>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        We couldn&rsquo;t find that page
      </h1>
      <p className="mt-3 max-w-md text-slate-600">
        {message ?? 'The page you were looking for may have moved or no longer exists.'}
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link to="/" className="btn-primary">
          Back to home
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <Link to="/tools" className="btn-secondary">
          Browse all tools
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
