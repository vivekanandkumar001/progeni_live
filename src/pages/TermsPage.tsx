import React from 'react';
import { Link } from '../components/AppLink';
import { useSeo } from '../lib/seo';

const TermsPage: React.FC = () => {
  useSeo({
    title: 'Terms of Use',
    description:
      'The simple ground rules for using Progeni and the tools in our collection.',
    canonicalPath: '/terms',
  });

  return (
    <div className="page-container py-12 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <header>
          <h1 className="section-title">Terms of Use</h1>
          <p className="section-subtitle">Last updated: October 2026</p>
        </header>

        <div className="mt-8 space-y-8 text-base leading-relaxed text-slate-600">
          <section aria-labelledby="using-progeni">
            <h2 id="using-progeni" className="text-lg font-bold text-slate-900">
              Using Progeni
            </h2>
            <p className="mt-3">
              By using this website or any tool in our collection, you agree to
              these terms. If you do not agree with them, please do not use the
              site.
            </p>
          </section>

          <section aria-labelledby="free-to-use">
            <h2 id="free-to-use" className="text-lg font-bold text-slate-900">
              Free to use
            </h2>
            <p className="mt-3">
              The tools on Progeni are free to use for personal and everyday
              work. You don&rsquo;t need an account, and there is nothing to
              buy.
            </p>
          </section>

          <section aria-labelledby="please-be-reasonable">
            <h2 id="please-be-reasonable" className="text-lg font-bold text-slate-900">
              Please be reasonable
            </h2>
            <p className="mt-3">
              Use the tools for lawful purposes only. Don&rsquo;t try to break,
              overload, or misuse the service, and don&rsquo;t use it in a way
              that harms other people.
            </p>
          </section>

          <section aria-labelledby="your-files">
            <h2 id="your-files" className="text-lg font-bold text-slate-900">
              Your files are your responsibility
            </h2>
            <p className="mt-3">
              Our tools process your files on your own device. Please keep your
              own backups of anything important. We can&rsquo;t recover a file
              you have changed or deleted on your device.
            </p>
          </section>

          <section aria-labelledby="no-guarantees">
            <h2 id="no-guarantees" className="text-lg font-bold text-slate-900">
              No guarantees
            </h2>
            <p className="mt-3">
              We work hard to keep everything running smoothly, but the site
              and its tools are provided &ldquo;as is&rdquo;, without promises
              that they will always be available or free of errors.
            </p>
          </section>

          <section aria-labelledby="changes-terms">
            <h2 id="changes-terms" className="text-lg font-bold text-slate-900">
              If these terms change
            </h2>
            <p className="mt-3">
              We may update these terms as Progeni grows. Continuing to use the
              site means you accept the latest version, which is always shown
              on this page.
            </p>
          </section>

          <section aria-labelledby="questions-terms">
            <h2 id="questions-terms" className="text-lg font-bold text-slate-900">
              Questions?
            </h2>
            <p className="mt-3">
              Reach us through the{' '}
              <Link to="/contact" className="font-medium text-indigo-600 transition-colors hover:text-indigo-700">
                contact page
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
