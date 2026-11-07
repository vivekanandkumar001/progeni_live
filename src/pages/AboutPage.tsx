import React from 'react';
import { Link } from '../components/AppLink';
import {
  ArrowRight,
  Boxes,
  Compass,
  Layers,
  Lock,
  Rocket,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { getPublicProducts } from '../registry/selectors';
import { useSeo } from '../lib/seo';

const AboutPage: React.FC = () => {
  useSeo({
    title: 'About Progeni — Free Browser-Based Tools',
    description:
      'Progeni brings useful digital tools together in one friendly place, so finding the right tool is simple.',
    canonicalPath: '/about',
  });

  const productCount = getPublicProducts().length;

  const highlights = [
    {
      icon: Search,
      title: 'Simple to find',
      text: 'Describe what you need and we will surface the right tool without the usual internet scavenger hunt.',
    },
    {
      icon: Boxes,
      title: 'One familiar place',
      text: 'Every tool follows the same familiar flow, so you spend less time learning and more time doing.',
    },
    {
      icon: ShieldCheck,
      title: 'Privacy details up front',
      text: 'Many tools run in your browser. Each product page explains any external processing or data sharing.',
    },
  ];

  const principles = [
    {
      icon: Layers,
      title: 'Useful first',
      text: 'We focus on tools that help with real work: files, media, documents, and everyday admin tasks.',
    },
    {
      icon: Rocket,
      title: 'Fast and lightweight',
      text: 'The goal is clear workflows, quick actions, and zero friction when you need a result now.',
    },
    {
      icon: Lock,
      title: 'Trust built in',
      text: 'We keep the experience straightforward and transparent, with browser-first tools that respect your privacy.',
    },
  ];

  return (
    <div className="page-container py-12 sm:py-16">
      <header className="mx-auto max-w-4xl text-center">
        <h1 className="section-title">About Progeni</h1>
        <p className="section-subtitle">One platform. Many possibilities.</p>
      </header>

      <div className="mx-auto mt-10 max-w-5xl space-y-12">
        <section className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
          <div className="space-y-6 text-base leading-relaxed text-slate-600">
            <p>
              Progeni is home to {productCount > 0 ? `${productCount} ` : ''}digital
              tools that help you get everyday tasks done. Instead of hunting across
              the internet for the right website, you can describe what you need and
              we will point you toward a tool that actually fits.
            </p>
            <p>
              Our ecosystem includes{' '}
              <a
                href="https://bench.progeni.live/"
                className="font-medium text-indigo-600 transition-colors hover:text-indigo-700"
              >
                Progeni Bench
              </a>{' '}
              and{' '}
              <a
                href="https://wakit.progeni.live/"
                className="font-medium text-indigo-600 transition-colors hover:text-indigo-700"
              >
                WaKit
              </a>
              , alongside a growing library of practical utilities for documents,
              media, productivity, and everyday admin work. Each product is
              maintained independently and has its own data-handling details.
            </p>
            <p>
              Most of the experience is browser-first: no installation, no account,
              and no unnecessary setup. The tools are designed to feel lightweight,
              clear, and ready when you are.
            </p>
          </div>

          <div className="rounded-3xl border border-indigo-100 bg-indigo-50 p-6 shadow-sm shadow-indigo-100/40">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-indigo-700">
              <Compass className="h-4 w-4" aria-hidden="true" />
              Why people use Progeni
            </div>
            <ul className="mt-5 space-y-4 text-sm leading-relaxed text-slate-700">
              <li className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-indigo-600" aria-hidden="true" />
                Find the right tool without browsing dozens of unrelated sites.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-indigo-600" aria-hidden="true" />
                Use a consistent interface across tools, categories, and workflows.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-indigo-600" aria-hidden="true" />
                Keep the experience practical, privacy-aware, and easy to return to.
              </li>
            </ul>
          </div>
        </section>

        <section className="space-y-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Built around real everyday needs
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {highlights.map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-sm font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              How Progeni works
            </h2>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {principles.map((item, index) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                    <item.icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-slate-900">A growing toolkit</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Progeni is designed to grow with the work you do. It brings together
              specialized utility sites and browser-based tools under one umbrella so
              you can discover and use what you need without friction.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {['Image tools', 'Audio tools', 'Productivity', 'Media workflows', 'Utility apps'].map((tag) => (
                <span key={tag} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-indigo-100 bg-indigo-50 p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-slate-900">Start exploring</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              Browse the full catalog or jump straight to a tool that matches your task.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to="/tools" className="btn-primary">
                Browse All Tools
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link to="/contact" className="btn-secondary">
                Contact us
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
