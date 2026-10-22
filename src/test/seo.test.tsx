import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { formatCalendarDate } from '../lib/dates';
import { renderAt } from './utils';

/** Reads a meta tag by name, tolerating tags that the page did not create. */
function metaContent(name: string): string | null {
  return document.querySelector(`meta[name="${name}"]`)?.getAttribute('content') ?? null;
}

describe('SEO metadata', () => {
  it('marks 404 pages as noindex so they are not indexed', () => {
    renderAt('/tools/this-tool-does-not-exist');
    expect(metaContent('robots')).toBe('noindex,follow');
  });

  it('marks the catch-all 404 route as noindex', () => {
    renderAt('/no-such-page-at-all');
    expect(metaContent('robots')).toBe('noindex,follow');
  });

  it('keeps real pages indexable', () => {
    renderAt('/tools/bench');
    expect(metaContent('robots')).toBe('index,follow');
  });

  it('does not canonicalise a missing product onto a live page', () => {
    renderAt('/tools/this-tool-does-not-exist');
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href');
    expect(canonical).toBe('https://progeni.live/tools/this-tool-does-not-exist');
    expect(canonical).not.toBe('https://progeni.live/tools');
  });

  it('sets a per-route title, description and canonical', () => {
    renderAt('/tools/bench');
    expect(document.title).toContain('Progeni Bench');
    expect(metaContent('description')).toContain('Progeni Bench');
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://progeni.live/tools/bench'
    );
  });
});

describe('formatCalendarDate', () => {
  it('formats a registry timestamp as its literal calendar date', () => {
    expect(formatCalendarDate('2026-10-15T00:00:00Z')).toBe('Oct 15, 2026');
  });

  it('does not shift the day for time zones west of UTC', () => {
    // 2026-10-15T00:00:00Z is Oct 14 in New York. The calendar date must win.
    const ny = new Date('2026-10-15T00:00:00Z').toLocaleDateString('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    expect(ny).toBe('Oct 14, 2026');
    expect(formatCalendarDate('2026-10-15T00:00:00Z')).toBe('Oct 15, 2026');
  });

  it('supports long month names for the whats-new page', () => {
    expect(
      formatCalendarDate('2024-10-01T00:00:00Z', { year: 'numeric', month: 'long', day: 'numeric' })
    ).toBe('October 1, 2024');
  });

  it('returns the raw value when the input is not a date', () => {
    expect(formatCalendarDate('not-a-date')).toBe('not-a-date');
  });
});

describe('ContactPage', () => {
  it('offers a direct email channel', () => {
    renderAt('/contact');
    expect(screen.getByRole('link', { name: /support@progeni\.live/i })).toBeInTheDocument();
  });

  it('links a tool to its real support page when one is declared', () => {
    renderAt('/contact');
    const benchLink = screen.getByRole('link', { name: /help with progeni bench/i });
    expect(benchLink).toHaveAttribute('href', 'https://bench.progeni.live/contact');
  });

  it('falls back to email for tools without a dedicated support page', () => {
    renderAt('/contact');
    const wakitLink = screen.getByRole('link', { name: /help with wakit/i });
    expect(wakitLink.getAttribute('href')).toMatch(/^mailto:support@progeni\.live/);
  });

  it('never links to a /contact path on a product subdomain that lacks one', () => {
    renderAt('/contact');
    const hrefs = Array.from(document.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(hrefs).not.toContain('https://wakit.progeni.live/contact');
  });
});

describe('HomePage', () => {
  it('lists every product exactly once', () => {
    renderAt('/');
    const names = screen
      .getAllByRole('heading', { level: 3 })
      .map((h) => h.textContent?.trim())
      .filter((n): n is string => Boolean(n));

    const benchCount = names.filter((n) => n === 'Progeni Bench').length;
    const wakitCount = names.filter((n) => n === 'WaKit (WhatsSwift)').length;

    expect(benchCount).toBe(1);
    expect(wakitCount).toBe(1);
  });

  it('does not repeat the same product across homepage sections', () => {
    renderAt('/');
    const sectionHeadings = screen
      .getAllByRole('heading', { level: 2 })
      .map((h) => h.textContent?.trim());
    // A section that would only re-list featured products is not rendered.
    expect(sectionHeadings).not.toContain('All Tools');
    expect(sectionHeadings).not.toContain('Just Added');
  });
});

describe('Typography consistency', () => {
  it('uses the same apostrophe style in the 404 heading and body', () => {
    renderAt('/tools/this-tool-does-not-exist');
    const heading = screen.getByRole('heading', { level: 1 }).textContent ?? '';
    const body = document.body.textContent ?? '';
    expect(heading).toContain('\u2019');
    expect(body).not.toMatch(/couldn't/);
    expect(body).not.toMatch(/don't have/);
  });

  it('uses US spelling consistently across marketing copy', () => {
    renderAt('/');
    expect(document.body.textContent).not.toMatch(/favourites/i);
    expect(document.body.textContent).toMatch(/favorites/i);
  });
});

describe('JSON-LD structured data', () => {
  /** Parses the single structured-data block the app writes into <head>. */
  function jsonLd(): any {
    const el = document.getElementById('progeni-jsonld');
    return el?.textContent ? JSON.parse(el.textContent) : null;
  }

  it('describes the site and its search box on the homepage', () => {
    renderAt('/');
    const data = jsonLd();
    expect(data['@type']).toBe('WebSite');
    expect(data.url).toBe('https://progeni.live/');
    expect(data.potentialAction['@type']).toBe('SearchAction');
    expect(data.potentialAction.target.urlTemplate).toContain('progeni.live/tools?q=');
  });

  it('describes a tool as a free WebApplication', () => {
    renderAt('/tools/bench');
    const data = jsonLd();
    const app = data['@graph'].find((n: any) => n['@type'] === 'WebApplication');
    expect(app).toBeDefined();
    expect(app.isAccessibleForFree).toBe(true);
    expect(app.offers.price).toBe('0');
    expect(app.featureList.length).toBeGreaterThan(10);
  });

  it('adds a breadcrumb trail to tool pages', () => {
    renderAt('/tools/bench');
    const data = jsonLd();
    const crumbs = data['@graph'].find((n: any) => n['@type'] === 'BreadcrumbList');
    expect(crumbs.itemListElement).toHaveLength(2);
    expect(crumbs.itemListElement[0].item).toBe('https://progeni.live/tools');
  });

  it('lists the catalogue on the all-tools page', () => {
    renderAt('/tools');
    const data = jsonLd();
    expect(data['@type']).toBe('ItemList');
    expect(data.itemListElement.length).toBeGreaterThan(0);
  });

  it('describes a category as a collection of tools', () => {
    renderAt('/categories/communication-messaging');
    const data = jsonLd();
    const page = data['@graph'].find((n: any) => n['@type'] === 'CollectionPage');
    expect(page).toBeDefined();
    expect(page.mainEntity.itemListElement.length).toBeGreaterThan(0);
  });

  it('never leaves stale structured data on a page that has none', () => {
    renderAt('/about');
    expect(jsonLd()).toBeNull();
  });

  it('keeps exactly one structured data block per page', () => {
    renderAt('/tools/bench');
    expect(document.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(1);
  });
});
