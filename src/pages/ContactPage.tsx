import React from 'react';
import { LifeBuoy, ExternalLink, ShieldCheck, Mail } from 'lucide-react';
import { getPublicProducts } from '../registry/selectors';
import { useSeo } from '../lib/seo';

const SUPPORT_EMAIL = 'support@progeni.live';

const ContactPage: React.FC = () => {
  useSeo({
    title: 'Contact Progeni — Support & Help',
    description:
      'Need help with a tool or have some feedback? Email support@progeni.live or open a tool’s support page.',
    canonicalPath: '/contact',
  });

  const products = getPublicProducts().filter((p) => p.status === 'active');

  return (
    <div className="page-container py-12 sm:py-16">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="section-title">Contact &amp; Help</h1>
        <p className="section-subtitle">
          Need a hand, or have an idea to share? We&rsquo;d love to hear from you.
        </p>
      </header>

      <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <LifeBuoy className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-lg font-bold text-slate-900">Get in touch</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Tell us which tool you were using and what happened, and we will do
          our best to help. Feedback about any part of Progeni is always
          welcome — it is how the collection keeps getting better.
        </p>

        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition-colors hover:bg-indigo-500"
        >
          <Mail className="h-4 w-4" aria-hidden="true" />
          {SUPPORT_EMAIL}
        </a>
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          We use email rather than a web form on purpose: a form needs a server
          to receive it, and we would rather not hold on to your details. We
          usually reply within one to two business days.
        </p>
      </div>

      {products.length > 0 && (
        <div className="mx-auto mt-10 max-w-2xl">
          <h2 className="text-lg font-bold text-slate-900">Help with a specific tool</h2>
          <p className="mt-1 text-sm text-slate-600">
            Some tools have their own support page with more detailed answers.
          </p>
          <ul className="mt-5 space-y-3">
            {products.map((product) => {
              const supportUrl = product.supportUrl;
              const label = `Help with ${product.name}`;
              const sub = supportUrl
                ? `Support page for ${product.name}`
                : `Email us about ${product.name}`;

              return (
                <li key={product.id}>
                  {supportUrl ? (
                    <a
                      href={supportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition-colors hover:border-indigo-300"
                    >
                      <span>
                        <span className="block text-sm font-semibold text-slate-900">
                          {label}
                        </span>
                        <span className="mt-0.5 block text-xs text-slate-500">
                          {sub}
                        </span>
                      </span>
                      <ExternalLink
                        className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-indigo-600"
                        aria-hidden="true"
                      />
                    </a>
                  ) : (
                    <a
                      href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
                        `Question about ${product.name}`
                      )}`}
                      className="group flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition-colors hover:border-indigo-300"
                    >
                      <span>
                        <span className="block text-sm font-semibold text-slate-900">
                          {label}
                        </span>
                        <span className="mt-0.5 block text-xs text-slate-500">
                          {sub}
                        </span>
                      </span>
                      <Mail
                        className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-indigo-600"
                        aria-hidden="true"
                      />
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="mx-auto mt-10 flex max-w-2xl items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-relaxed text-emerald-900">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
        <p>
          Your files are private. Our tools work on your own device, so your
          documents and photos never need to be sent to us.
        </p>
      </div>
    </div>
  );
};

export default ContactPage;
