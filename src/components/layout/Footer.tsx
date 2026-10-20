import React from 'react';
import { Link } from 'react-router-dom';
import { LogoMark } from '../Logo';
import { getPublicProducts } from '../../registry/selectors';

const Footer: React.FC = () => {
  const products = getPublicProducts().filter((p) => p.status === 'active');

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="page-container py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link to="/" className="flex items-center gap-2.5" aria-label="Progeni home">
              <LogoMark className="h-8 w-8" />
              <span className="font-extrabold tracking-tight text-slate-900">Progeni</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              One platform. Many possibilities. Discover useful digital tools,
              all in one place.
            </p>
          </div>

          {/* Products */}
          <nav aria-label="Products">
            <h2 className="text-sm font-semibold text-slate-900">Products</h2>
            <ul className="mt-3 space-y-2.5">
              {products.map((product) => (
                <li key={product.id}>
                  <a
                    href={product.destination.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-slate-600 transition-colors hover:text-indigo-700"
                  >
                    {product.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Explore */}
          <nav aria-label="Explore">
            <h2 className="text-sm font-semibold text-slate-900">Explore</h2>
            <ul className="mt-3 space-y-2.5">
              <li>
                <Link to="/tools" className="text-sm text-slate-600 transition-colors hover:text-indigo-700">
                  All Services
                </Link>
              </li>
              <li>
                <Link to="/new" className="text-sm text-slate-600 transition-colors hover:text-indigo-700">
                  What&rsquo;s New
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-slate-600 transition-colors hover:text-indigo-700">
                  About
                </Link>
              </li>
            </ul>
          </nav>

          {/* Help */}
          <nav aria-label="Help and legal">
            <h2 className="text-sm font-semibold text-slate-900">Help</h2>
            <ul className="mt-3 space-y-2.5">
              <li>
                <Link to="/contact" className="text-sm text-slate-600 transition-colors hover:text-indigo-700">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-slate-600 transition-colors hover:text-indigo-700">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-slate-600 transition-colors hover:text-indigo-700">
                  Terms
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Progeni. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
