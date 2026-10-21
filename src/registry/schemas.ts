import { z } from 'zod';

export const DestinationSchema = z.object({
  type: z.enum(['subdomain', 'path', 'external']),
  url: z.string().url(),
  canonicalUrl: z.string().url().optional(),
});

export const ProductSeoSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  indexable: z.boolean().default(true),
});

export const ProductStatusSchema = z.enum([
  'development',
  'beta',
  'active',
  'maintenance',
  'deprecated',
]);

export const ProductVisibilitySchema = z.enum([
  'public',
  'unlisted',
  'private',
]);

export const ProductHostingSchema = z.enum([
  'standalone',
  'integrated',
]);

export const ProductSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be kebab-case'),
  name: z.string().min(1, 'Name is required'),
  shortDescription: z.string().min(10, 'Short description must be at least 10 chars'),
  description: z.string().optional(),
  categoryIds: z.array(z.string()).min(1, 'At least one category is required'),
  tags: z.array(z.string()).default([]),
  capabilities: z.array(z.string()).default([]),
  status: ProductStatusSchema,
  visibility: ProductVisibilitySchema,
  hosting: ProductHostingSchema,
  destination: DestinationSchema,
  /**
   * Optional dedicated support page for this product. Only set this when the
   * URL is known to exist — the contact page links to it directly, and a dead
   * link there is worse than no link at all.
   */
  supportUrl: z.string().url().optional(),
  icon: z.string().min(1, 'Icon identifier is required'),
  featured: z.boolean().default(false),
  sortOrder: z.number().default(100),
  seo: ProductSeoSchema.default({ indexable: true }),
  createdAt: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  updatedAt: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
});

export const CategoryVisibilitySchema = z.enum(['public', 'private']);

export const CategorySchema = z.object({
  id: z.string().min(1, 'Category ID is required'),
  slug: z.string().min(1, 'Category slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be kebab-case'),
  name: z.string().min(1, 'Category name is required'),
  description: z.string().min(5, 'Description is required'),
  icon: z.string().min(1, 'Icon is required'),
  sortOrder: z.number().default(100),
  visibility: CategoryVisibilitySchema.default('public'),
});

export type Destination = z.infer<typeof DestinationSchema>;
export type ProductSeo = z.infer<typeof ProductSeoSchema>;
export type ProductStatus = z.infer<typeof ProductStatusSchema>;
export type ProductVisibility = z.infer<typeof ProductVisibilitySchema>;
export type ProductHosting = z.infer<typeof ProductHostingSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type CategoryVisibility = z.infer<typeof CategoryVisibilitySchema>;
export type Category = z.infer<typeof CategorySchema>;
