import { describe, it, expect } from 'vitest';
import { searchCatalog, normalizeText } from '../lib/search';

describe('normalizeText', () => {
  it('lowercases and trims', () => {
    expect(normalizeText('  Hello WORLD  ')).toBe('hello world');
  });

  it('collapses internal whitespace', () => {
    expect(normalizeText('too   many    spaces')).toBe('too many spaces');
  });

  it('removes punctuation noise', () => {
    expect(normalizeText('hello, world! #test')).toBe('hello world test');
  });
});

describe('searchCatalog', () => {
  it('finds a product by exact name (case-insensitive)', () => {
    const results = searchCatalog('progeni bench');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].product.slug).toBe('bench');
    expect(results[0].matchedField).toBe('name');
  });

  it('finds a product by slug', () => {
    const results = searchCatalog('wakit');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].product.slug).toBe('wakit');
  });

  it('finds products by tag', () => {
    const results = searchCatalog('whatsapp');
    expect(results.some((r) => r.product.slug === 'wakit')).toBe(true);
  });

  it('finds products by capability text', () => {
    const results = searchCatalog('subtitle');
    expect(results.some((r) => r.product.slug === 'bench')).toBe(true);
  });

  it('finds products by category name', () => {
    const results = searchCatalog('communication');
    expect(results.some((r) => r.product.slug === 'wakit')).toBe(true);
  });

  it('is case-insensitive', () => {
    const lower = searchCatalog('bench');
    const upper = searchCatalog('BENCH');
    const mixed = searchCatalog('BeNcH');
    expect(lower.map((r) => r.product.slug)).toEqual(upper.map((r) => r.product.slug));
    expect(upper.map((r) => r.product.slug)).toEqual(mixed.map((r) => r.product.slug));
  });

  it('handles extra whitespace in queries', () => {
    const results = searchCatalog('   bench   ');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].product.slug).toBe('bench');
  });

  it('returns an empty array for gibberish queries', () => {
    const results = searchCatalog('xyzzyplughnotatool');
    expect(results).toEqual([]);
  });

  it('returns all public products for an empty query', () => {
    const results = searchCatalog('');
    expect(results.length).toBeGreaterThanOrEqual(2);
  });

  it('ranks exact name matches highest', () => {
    const results = searchCatalog('bench');
    expect(results[0].product.slug).toBe('bench');
    expect(results[0].score).toBeGreaterThan(500); // exact-name-match territory
    // A description-only match for the same term would score far lower.
    const descOnly = searchCatalog('spreadsheet utilities');
    expect(descOnly[0].score).toBeLessThan(results[0].score);
  });

  it('filters by category slug', () => {
    const results = searchCatalog('', { categorySlug: 'communication-messaging' });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((r) => r.product.categoryIds.length > 0)).toBe(true);
    expect(results.some((r) => r.product.slug === 'wakit')).toBe(true);
    expect(results.some((r) => r.product.slug === 'bench')).toBe(false);
  });

  it('treats unknown category slugs as no filter matches', () => {
    const results = searchCatalog('', { categorySlug: 'no-such-category' });
    expect(results).toEqual([]);
  });

  it('never returns unlisted or private products', () => {
    // All shipped products are public; empty-query results must all be public.
    const results = searchCatalog('');
    for (const r of results) {
      expect(r.product.visibility).toBe('public');
    }
  });

  it('matches multi-token queries', () => {
    const results = searchCatalog('whatsapp video splitter');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].product.slug).toBe('wakit');
  });

  it('respects minQueryLength so a single letter matches nothing', () => {
    expect(searchCatalog('a', { minQueryLength: 2 })).toEqual([]);
  });

  it('still matches a single letter when no minimum is requested', () => {
    // The /tools grid filters as you type, so a one-character query must
    // still return something there.
    expect(searchCatalog('a').length).toBeGreaterThan(0);
  });

  it('ranks a whole-word match above a mid-word match', () => {
    const results = searchCatalog('label');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].product.slug).toBe('bench');
  });
});
