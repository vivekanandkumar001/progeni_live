import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * The live site is a single-page app served from a static build. Without a
 * rewrite, every client-side route (13 of the 14 URLs in the sitemap) returns
 * a hard 404 while the homepage works, which is exactly how the production
 * site behaved before `vercel.json` was added.
 *
 * These tests are the regression guard for that: they assert the rewrite
 * pattern still sends every real route to index.html and still lets every
 * static file through untouched.
 */
const config = JSON.parse(
  readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf-8')
) as { rewrites?: Array<{ source: string; destination: string }> };

const APP_ROUTES = [
  '/',
  '/tools',
  '/tools/bench',
  '/tools/wakit',
  '/categories/privacy-file-tools',
  '/categories/communication-messaging',
  '/categories/media-audio-video',
  '/categories/developer-data',
  '/categories/productivity',
  '/new',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
];

const STATIC_FILES = [
  '/favicon.svg',
  '/robots.txt',
  '/sitemap.xml',
  '/og-image.jpg',
  '/assets/index-D0X3MYXl.js',
  '/assets/index-BLB_LNke.css',
];

describe('Vercel SPA rewrite', () => {
  const rewrite = config.rewrites?.[0];

  it('exists and points every unmatched path at index.html', () => {
    expect(rewrite).toBeDefined();
    expect(rewrite?.destination).toBe('/index.html');
  });

  it('rewrites every route listed in the sitemap', () => {
    const pattern = new RegExp(rewrite!.source);
    for (const route of APP_ROUTES) {
      expect(pattern.test(route), `${route} must be rewritten to index.html`).toBe(
        true
      );
    }
  });

  it('never swallows a static file', () => {
    const pattern = new RegExp(rewrite!.source);
    for (const file of STATIC_FILES) {
      expect(pattern.test(file), `${file} must be served as a file`).toBe(false);
    }
  });
});
