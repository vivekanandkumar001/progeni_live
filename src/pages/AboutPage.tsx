import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, Boxes, Rocket, ArrowRight } from 'lucide-react';
import { getPublicProducts } from '../registry/selectors';
import { useSeo } from '../lib/seo';

const AboutPage: React.FC = () => {
  useSeo({
    title: 'About Progeni',
    description:
      'Progeni brings useful digital tools together in one friendly place, so finding the right tool is simple.',
    canonicalPath: '/about',
  });

  const productCount = getPublicProducts().length;

  return (
    <div className="page-container py-12 sm:py-16">
      <header className="mx-auto max-w-3xl text-center">
        <h1 className="section-title">About Progeni</h1>
        <p className="section-subtitle">One platform. Many possibilities.</p>
      </header>

      <div className="mx-auto mt-10 max-w-3xl space-y-6 text-base leading-relaxed text-slate-600">
        <p>
          Progeni is home to {productCount > 0 ? `${productCount} ` : ''}digital
          tools that help you get everyday things done. Instead of hunting
          across the internet for the right website, you can describe what you
          want to do and we will point you to a tool that does it.
        </p>
        <p>
          Our tools include{' '}
          <a
            href="https://bench.progeni.live/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-indigo-600 transition-colors hover:text-indigo-700"
          >
            Progeni Bench
          </a>{' '}
          and{' '}
          <a
            href="https://wakit.progeni.live/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-indigo-600 transition-colors hover:text-indigo-700"
          >
            WaKit
          </a>
          . Most of them work directly in your browser — there is nothing to
          install and no account to create. Your files stay on your own device.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-3">
        {[
          {
            icon: Layers,
            title: 'Simple to find',
            text: 'Tell us what you need and we will show you the right tool.',
          },
          {
            icon: Boxes,
            title: 'One familiar place',
            text: 'Every tool works the same way, so you never have to learn a new site.',
          },
          {
            icon: Rocket,
            title: 'Always improving',
            text: 'We keep adding new tools and new kinds of help.',
          },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <item.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-sm font-bold text-slate-900">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.text}</p>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-indigo-100 bg-indigo-50 p-8 text-center">
        <h2 className="text-lg font-bold text-slate-900">Start exploring</h2>
        <p className="mt-2 text-sm text-slate-600">
          Browse everything we have, or search for exactly what you need.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/tools" className="btn-primary">
            Browse All Tools
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link to="/contact" className="btn-secondary">
            Contact us
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
