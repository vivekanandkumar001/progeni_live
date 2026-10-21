import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Compass,
  Layers,
  Boxes,
  ShieldCheck,
} from 'lucide-react';
import SearchBox from '../components/search/SearchBox';
import { ProductCard } from '../components/ProductCard';
import { CategoryCard } from '../components/CategoryCard';
import {
  getFeaturedProducts,
  getPublicProducts,
  getCategoriesWithCounts,
  getRecentlyLaunched,
} from '../registry/selectors';
import { useSeo, useJsonLd } from '../lib/seo';

const HomePage: React.FC = () => {
  useSeo({
    title: 'Progeni — Discover digital tools for whatever you need to do',
    // Must stay byte-identical to the static description in index.html: social
    // scrapers and crawlers that do not execute JavaScript read that one.
    description:
      'One Platform. Many Possibilities. Discover useful digital tools and services that help you get things done — no sign-ups, no complicated setup.',
    canonicalPath: '/',
  });

  // WebSite + SearchAction: this is what makes Progeni eligible for the
  // Google sitelinks search box, and tells search engines the site really is
  // a collection of tools rather than a blog.
  useJsonLd({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Progeni',
    url: 'https://progeni.live/',
    description:
      'One Platform. Many Possibilities. Discover useful digital tools and services that help you get things done — no sign-ups, no complicated setup.',
    inLanguage: 'en-US',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://progeni.live/tools?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  });

  const featured = getFeaturedProducts();
  const allProducts = getPublicProducts();
  const categories = getCategoriesWithCounts().filter((c) => c.count > 0);

  // Every product appears exactly once on the homepage. Taking the newest
  // products first and then filtering out featured ones means a catalog where
  // everything is featured would otherwise repeat the same cards in
  // "Featured Tools", "Just Added" and "All Tools" — duplicate content for
  // crawlers, and noise for visitors.
  const featuredIds = new Set(featured.map((p) => p.id));
  const recent = getRecentlyLaunched(3).filter((p) => !featuredIds.has(p.id));
  const recentIds = new Set(recent.map((p) => p.id));
  const preview = allProducts
    .filter((p) => !featuredIds.has(p.id) && !recentIds.has(p.id))
    .slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-white to-[#f5f6fb]">
        <div className="page-container flex flex-col items-center py-20 text-center sm:py-28">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-medium text-indigo-700">
            Everything in one place
          </span>

          <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            One Platform.{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Many Possibilities.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Discover useful digital tools and services designed to help you get
            things done — no sign-ups, no complicated setup.
          </p>

          <div className="mt-8 w-full max-w-2xl">
            <SearchBox large submitPath="/tools" />
          </div>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Link to="/tools" className="btn-primary">
              Explore All Tools
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link to="/about" className="btn-secondary">
              <Compass className="h-4 w-4" aria-hidden="true" />
              About Progeni
            </Link>
          </div>
        </div>
      </section>

      {/* Featured services */}
      {featured.length > 0 && (
        <section aria-labelledby="featured-heading" className="border-b border-slate-200 py-16 sm:py-20">
          <div className="page-container">
            <h2 id="featured-heading" className="section-title">
              Featured Tools
            </h2>
            <p className="section-subtitle">
              A few of our favorites, ready to use right now.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section aria-labelledby="categories-heading" className="border-b border-slate-200 bg-white py-16 sm:py-20">
          <div className="page-container">
            <h2 id="categories-heading" className="section-title">
              Browse by Category
            </h2>
            <p className="section-subtitle">
              Find tools grouped by the kind of task you want to finish.
            </p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recently launched */}
      {recent.length > 0 && (
        <section aria-labelledby="recent-heading" className="border-b border-slate-200 py-16 sm:py-20">
          <div className="page-container">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 id="recent-heading" className="section-title">
                  Just Added
                </h2>
                <p className="section-subtitle">The newest tools in the collection.</p>
              </div>
              <Link
                to="/new"
                className="hidden shrink-0 items-center gap-1 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700 sm:flex"
              >
                See all
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recent.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* More services preview */}
      {preview.length > 0 && (
        <section aria-labelledby="services-heading" className="border-b border-slate-200 bg-white py-16 sm:py-20">
          <div className="page-container">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 id="services-heading" className="section-title">
                  More Tools
                </h2>
                <p className="section-subtitle">
                  A few more from the collection, ready to use.
                </p>
              </div>
              <Link
                to="/tools"
                className="hidden shrink-0 items-center gap-1 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700 sm:flex"
              >
                Browse all
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {preview.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Link to="/tools" className="btn-primary">
                Browse All Tools
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* About */}
      <section aria-labelledby="about-heading" className="py-16 sm:py-20">
        <div className="page-container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="about-heading" className="section-title">
              Why Progeni
            </h2>
            <p className="section-subtitle">
              We collect handy digital tools in one friendly place, so you can
              get on with what matters.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Layers,
                title: 'Easy to find',
                text: 'Just describe what you need — we will point you to the right tool.',
              },
              {
                icon: Boxes,
                title: 'Everything together',
                text: 'All our tools live under one roof, with a familiar experience.',
              },
              {
                icon: ShieldCheck,
                title: 'Private by default',
                text: 'Our tools are built to work on your device, not on a remote server.',
              },
              {
                icon: Compass,
                title: 'Always growing',
                text: 'New tools and new kinds of help keep joining the collection.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-sm font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/about" className="btn-secondary">
              Learn more about Progeni
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
