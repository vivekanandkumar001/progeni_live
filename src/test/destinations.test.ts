import { describe, it, expect } from 'vitest';
import { resolveDestination } from '../lib/destinations';
import { Product } from '../registry/schemas';

const baseProduct = {
  id: 'p1',
  slug: 'tool',
  name: 'Tool',
  shortDescription: 'A tool that does a thing reliably.',
  categoryIds: ['c1'],
  tags: [],
  capabilities: [],
  status: 'active' as const,
  visibility: 'public' as const,
  hosting: 'standalone' as const,
  icon: 'Wrench',
  featured: false,
  sortOrder: 100,
  seo: { indexable: true },
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

function product(overrides: Partial<Product>): Product {
  return {
    ...baseProduct,
    destination: { type: 'subdomain', url: 'https://tool.progeni.live/' },
    ...overrides,
  } as Product;
}

describe('resolveDestination', () => {
  it('marks subdomain destinations as external with safe rel', () => {
    const result = resolveDestination(product({}));
    expect(result.isExternal).toBe(true);
    expect(result.target).toBe('_blank');
    expect(result.rel).toBe('noopener noreferrer');
    expect(result.url).toBe('https://tool.progeni.live/');
  });

  it('marks external destinations as external', () => {
    const result = resolveDestination(
      product({
        destination: { type: 'external', url: 'https://example.com/tool' },
      })
    );
    expect(result.isExternal).toBe(true);
    expect(result.url).toBe('https://example.com/tool');
  });

  it('marks path destinations as internal', () => {
    const result = resolveDestination(
      product({
        hosting: 'integrated',
        destination: { type: 'path', url: '/tools/integrated-tool' },
      })
    );
    expect(result.isExternal).toBe(false);
    expect(result.url).toBe('/tools/integrated-tool');
  });

  it('falls back safely for unsupported protocols', () => {
    const result = resolveDestination(
      product({
        destination: { type: 'external', url: 'javascript:alert(1)' } as never,
      })
    );
    expect(result.url).toBe('/tools/tool');
    expect(result.isExternal).toBe(false);
  });

  it('falls back safely for malformed URLs', () => {
    const result = resolveDestination(
      product({
        destination: { type: 'external', url: ':::bad:::' } as never,
      })
    );
    expect(result.url).toBe('/tools/tool');
    expect(result.isExternal).toBe(false);
  });
});
