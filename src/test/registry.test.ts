import { describe, it, expect } from 'vitest';
import { validateRegistry } from '../registry/validation';
import { ProductSchema, CategorySchema } from '../registry/schemas';
import productsData from '../registry/products.json';
import categoriesData from '../registry/categories.json';

const validCategory = {
  id: 'cat-test',
  slug: 'test-category',
  name: 'Test Category',
  description: 'A test category for unit tests.',
  icon: 'Layers',
  sortOrder: 1,
  visibility: 'public',
};

const validProduct = {
  id: 'prod-test',
  slug: 'test-product',
  name: 'Test Product',
  shortDescription: 'A perfectly valid short description for testing.',
  description: 'A longer description.',
  categoryIds: ['cat-test'],
  tags: ['test'],
  capabilities: ['Does testing'],
  status: 'active',
  visibility: 'public',
  hosting: 'standalone',
  destination: {
    type: 'subdomain',
    url: 'https://test.progeni.live/',
  },
  icon: 'Wrench',
  featured: false,
  sortOrder: 50,
  seo: { indexable: true },
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('ProductSchema', () => {
  it('accepts a valid product', () => {
    const result = ProductSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
  });

  it('rejects an empty name', () => {
    const result = ProductSchema.safeParse({ ...validProduct, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects a non-kebab-case slug', () => {
    const result = ProductSchema.safeParse({ ...validProduct, slug: 'Bad Slug!' });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid destination URL', () => {
    const result = ProductSchema.safeParse({
      ...validProduct,
      destination: { type: 'subdomain', url: 'not-a-url' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects unsupported destination types', () => {
    const result = ProductSchema.safeParse({
      ...validProduct,
      destination: { type: 'ftp', url: 'https://example.com' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid status values', () => {
    const result = ProductSchema.safeParse({ ...validProduct, status: 'exploded' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid visibility values', () => {
    const result = ProductSchema.safeParse({ ...validProduct, visibility: 'semipublic' });
    expect(result.success).toBe(false);
  });

  it('rejects a short description under 10 characters', () => {
    const result = ProductSchema.safeParse({ ...validProduct, shortDescription: 'short' });
    expect(result.success).toBe(false);
  });

  it('rejects a product with no categories', () => {
    const result = ProductSchema.safeParse({ ...validProduct, categoryIds: [] });
    expect(result.success).toBe(false);
  });
});

describe('CategorySchema', () => {
  it('accepts a valid category', () => {
    const result = CategorySchema.safeParse(validCategory);
    expect(result.success).toBe(true);
  });

  it('rejects a duplicate-style empty category name', () => {
    const result = CategorySchema.safeParse({ ...validCategory, name: '' });
    expect(result.success).toBe(false);
  });
});

describe('validateRegistry', () => {
  it('accepts the shipped registry data', () => {
    const result = validateRegistry();
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
    expect(result.productCount).toBeGreaterThan(0);
    expect(result.categoryCount).toBeGreaterThan(0);
  });

  it('rejects duplicate product IDs', () => {
    const result = validateRegistry(
      [validProduct, { ...validProduct, slug: 'other-slug' }],
      [validCategory]
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Duplicate product id'))).toBe(true);
  });

  it('rejects duplicate product slugs', () => {
    const result = validateRegistry(
      [validProduct, { ...validProduct, id: 'prod-other' }],
      [validCategory]
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Duplicate product slug'))).toBe(true);
  });

  it('rejects products referencing nonexistent categories', () => {
    const result = validateRegistry(
      [{ ...validProduct, categoryIds: ['cat-missing'] }],
      [validCategory]
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('nonexistent category'))).toBe(true);
  });

  it('rejects products with malformed URLs', () => {
    const result = validateRegistry(
      [
        {
          ...validProduct,
          destination: { type: 'external', url: 'definitely not a url' },
        },
      ],
      [validCategory]
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('schema validation'))).toBe(true);
  });

  it('rejects duplicate category IDs', () => {
    const result = validateRegistry(
      [validProduct],
      [validCategory, { ...validCategory, slug: 'other-slug' }]
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Duplicate category id'))).toBe(true);
  });

  it('rejects invalid product records entirely', () => {
    const result = validateRegistry([{ garbage: true }], [validCategory]);
    expect(result.valid).toBe(false);
    expect(result.productCount).toBe(0);
  });

  it('rejects non-array inputs', () => {
    const result = validateRegistry('nope' as never, [validCategory]);
    expect(result.valid).toBe(false);
  });
});

describe('shipped registry consistency', () => {
  it('every product category reference exists in categories.json', () => {
    const categoryIds = new Set(categoriesData.map((c) => (c as { id: string }).id));
    for (const product of productsData) {
      for (const catId of (product as { categoryIds: string[] }).categoryIds) {
        expect(categoryIds.has(catId)).toBe(true);
      }
    }
  });

  it('every destination URL is https', () => {
    for (const product of productsData) {
      const url = (product as { destination: { url: string } }).destination.url;
      expect(url.startsWith('https://')).toBe(true);
    }
  });
});
