import React from 'react';
import { Link } from '../components/AppLink';
import { ShieldCheck } from 'lucide-react';
import { useSeo } from '../lib/seo';

const PrivacyPage: React.FC = () => {
  useSeo({
    title: 'Privacy Policy — Progeni',
    description:
      'Your files stay on your device. Here is how Progeni handles your information in plain language.',
    canonicalPath: '/privacy',
  });

  return (
    <div className="page-container py-12 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <header>
          <h1 className="section-title">Privacy</h1>
          <p className="section-subtitle">Last updated: October 2026</p>
        </header>

        <div className="mt-8 space-y-8 text-base leading-relaxed text-slate-600">
          <section aria-labelledby="short-version">
            <h2 id="short-version" className="text-lg font-bold text-slate-900">
              The short version
            </h2>
            <p className="mt-3">
              Your files stay on your device. Our tools do their work inside
              your browser, so the documents, photos and files you use are
              never uploaded to us. You don&rsquo;t need an account to use
              Progeni, and we don&rsquo;t ask for personal information.
            </p>
          </section>

          <section aria-labelledby="this-website">
            <h2 id="this-website" className="text-lg font-bold text-slate-900">
              This website
            </h2>
            <p className="mt-3">
              The Progeni website is here to help you find tools. Browsing and
              searching happen on your own device. Like almost every website,
              our hosting provider may process basic technical information
              (such as your IP address) to deliver pages to you, under their
              own privacy policy.
            </p>
          </section>

          <section aria-labelledby="fonts-and-hosting">
            <h2 id="fonts-and-hosting" className="text-lg font-bold text-slate-900">
              Fonts and hosting
            </h2>
            <p className="mt-3">
              The site&rsquo;s fonts are loaded from Google&rsquo;s font
              service, which means your browser makes a request to Google and
              Google sees your IP address. If you would rather avoid that, a
              content blocker or a privacy-focused browser extension will stop
              the fonts from loading — the site still works, using your
              device&rsquo;s built-in fonts instead.
            </p>
          </section>

          <section aria-labelledby="our-tools">
            <h2 id="our-tools" className="text-lg font-bold text-slate-900">
              Our tools
            </h2>
            <p className="mt-3">
              Tools like Progeni Bench and WaKit are designed to work entirely
              on your device. When you open a file, it is processed in your
              browser&rsquo;s memory and is not sent anywhere. Each tool has
              its own privacy page, which applies while you use that tool.
            </p>
          </section>

          <section aria-labelledby="no-tracking">
            <h2 id="no-tracking" className="text-lg font-bold text-slate-900">
              No tracking on this site
            </h2>
            <p className="mt-3">
              We do not add advertising trackers or sell your information. We
              keep things simple: a directory of tools, no accounts, no
              personal data collection.
            </p>
          </section>

          <section aria-labelledby="changes-privacy">
            <h2 id="changes-privacy" className="text-lg font-bold text-slate-900">
              If this changes
            </h2>
            <p className="mt-3">
              As Progeni grows, this page may be updated. The date at the top
              always shows the latest version.
            </p>
          </section>

          <section aria-labelledby="questions-privacy">
            <h2 id="questions-privacy" className="text-lg font-bold text-slate-900">
              Questions?
            </h2>
            <p className="mt-3">
              Please use our{' '}
              <Link to="/contact" className="font-medium text-indigo-600 transition-colors hover:text-indigo-700">
                contact page
              </Link>{' '}
              and we will be happy to help.
            </p>
          </section>
        </div>

        <div className="mt-10 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-relaxed text-emerald-900">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
          <p>
            Privacy is built in, not bolted on: our tools are designed to keep
            your files on your own device.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
