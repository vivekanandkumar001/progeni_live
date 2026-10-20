import { describe, it, expect, vi } from 'vitest';

// Mock registry JSON to control visibility/status in selector tests
vi.mock('../registry/products.json', () => ({
  default: [
    {
      id: 'p-public',
      slug: 'public-tool',
      name: 'Public Tool',
      shortDescription: 'A public active tool description.',
      categoryIds: ['c1'],
      tags: [],
      capabilities: [],
      status: 'active',
      visibility: 'public',
      hosting: 'standalone',
      destination: { type: 'subdomain', url: 'https://public.example.com/' },
      icon: 'Wrench',
      featured: true,
      sortOrder: 1,
      seo: { indexable: true },
      createdAt: '2026-01-03T00:00:00Z',
      updatedAt: '2026-01-03T00:00:00Z',
    },
    {
      id: 'p-unlisted',
      slug: 'unlisted-tool',
      name: 'Unlisted Tool',
      shortDescription: 'An unlisted tool description.',
      categoryIds: ['c1'],
      tags: [],
      capabilities: [],
      status: 'active',
      visibility: 'unlisted',
      hosting: 'standalone',
      destination: { type: 'subdomain', url: 'https://unlisted.example.com/' },
      icon: 'Wrench',
      featured: true,
      sortOrder: 2,
      seo: { indexable: false },
      createdAt: '2026-01-02T00:00:00Z',
      updatedAt: '2026-01-02T00:00:00Z',
    },
    {
      id: 'p-private',
      slug: 'private-tool',
      name: 'Private Tool',
      shortDescription: 'A private tool description.',
      categoryIds: ['c1'],
      tags: [],
      capabilities: [],
      status: 'active',
      visibility: 'private',
      hosting: 'integrated',
      destination: { type: 'path', url: 'https://progeni.live/tools/private-tool' },
      icon: 'Wrench',
      featured: true,
      sortOrder: 3,
      seo: { indexable: false },
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'p-deprecated',
      slug: 'deprecated-tool',
      name: 'Deprecated Tool',
      shortDescription: 'A deprecated tool description.',
      categoryIds: ['c1'],
      tags: [],
      capabilities: [],
      status: 'deprecated',
      visibility: 'public',
      hosting: 'standalone',
      destination: { type: 'external', url: 'https://old.example.com/' },
      icon: 'Wrench',
      featured: true,
      sortOrder: 4,
      seo: { indexable: false },
      createdAt: '2025-12-01T00:00:00Z',
      updatedAt: '2025-12-01T00:00:00Z',
    },
  ],
}));

vi.mock('../registry/categories.json', () => ({
  default: [
    {
      id: 'c1',
      slug: 'cat-one',
      name: 'Category One',
      description: 'The first test category.',
      icon: 'Layers',
      sortOrder: 1,
      visibility: 'public',
    },
    {
      id: 'c2',
      slug: 'cat-private',
      name: 'Private Category',
      description: 'A private test category.',
      icon: 'Layers',
      sortOrder: 2,
      visibility: 'private',
    },
  ],
}));

import {
  getPublicProducts,
  getFeaturedProducts,
  getProductBySlug,
  getRecentlyLaunched,
  getPublicCategories,
  getCategoryBySlug,
  getCategoriesWithCounts,
  getProductsByCategorySlug,
} from '../registry/selectors';

describe('getPublicProducts', () => {
  it('excludes unlisted and private products', () => {
    const slugs = getPublicProducts().map((p) => p.slug);
    expect(slugs).not.toContain('unlisted-tool');
    expect(slugs).not.toContain('private-tool');
  });

  it('excludes deprecated products', () => {
    const slugs = getPublicProducts().map((p) => p.slug);
    expect(slugs).not.toContain('deprecated-tool');
  });

  it('includes active public products', () => {
    const slugs = getPublicProducts().map((p) => p.slug);
    expect(slugs).toContain('public-tool');
  });

  it('sorts by sortOrder ascending', () => {
    const products = getPublicProducts();
    const orders = products.map((p) => p.sortOrder);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });
});

describe('getFeaturedProducts', () => {
  it('only includes public active products', () => {
    const slugs = getFeaturedProducts().map((p) => p.slug);
    expect(slugs).toEqual(['public-tool']);
  });
});

describe('getProductBySlug', () => {
  it('resolves public products case-insensitively', () => {
    expect(getProductBySlug('PUBLIC-TOOL')?.id).toBe('p-public');
  });

  it('resolves unlisted products by direct link (but they stay out of listings)', () => {
    expect(getProductBySlug('unlisted-tool')?.id).toBe('p-unlisted');
  });

  it('never resolves private products', () => {
    expect(getProductBySlug('private-tool')).toBeUndefined();
  });

  it('returns undefined for unknown slugs', () => {
    expect(getProductBySlug('nope')).toBeUndefined();
  });
});

describe('getRecentlyLaunched', () => {
  it('orders by createdAt descending', () => {
    const slugs = getRecentlyLaunched().map((p) => p.slug);
    expect(slugs).toEqual(['public-tool']);
  });

  it('respects the limit', () => {
    expect(getRecentlyLaunched(1).length).toBeLessThanOrEqual(1);
  });
});

describe('categories', () => {
  it('excludes private categories from public lists', () => {
    const slugs = getPublicCategories().map((c) => c.slug);
    expect(slugs).toContain('cat-one');
    expect(slugs).not.toContain('cat-private');
  });

  it('does not resolve private categories by slug', () => {
    expect(getCategoryBySlug('cat-private')).toBeUndefined();
  });

  it('computes accurate product counts per category', () => {
    const cats = getCategoriesWithCounts();
    const catOne = cats.find((c) => c.slug === 'cat-one');
    expect(catOne?.count).toBe(1); // only public-tool counts
  });

  it('returns only public products for a category', () => {
    const products = getProductsByCategorySlug('cat-one');
    expect(products.map((p) => p.slug)).toEqual(['public-tool']);
  });

  it('returns empty for unknown categories', () => {
    expect(getProductsByCategorySlug('missing')).toEqual([]);
  });
});
