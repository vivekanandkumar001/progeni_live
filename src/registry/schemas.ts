import { z } from 'zod';

function isSafeHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch {
    return false;
  }
}

export const DestinationSchema = z
  .object({
    type: z.enum(['subdomain', 'path', 'external']),
    url: z.string().min(1),
    canonicalUrl: z.string().optional(),
  })
  .superRefine((destination, context) => {
    if (destination.type === 'path') {
      if (
        !destination.url.startsWith('/') ||
        destination.url.startsWith('//') ||
        destination.url.includes('\\')
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['url'],
          message: 'Path destinations must be safe, same-origin absolute paths.',
        });
      }
    } else if (!isSafeHttpsUrl(destination.url)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['url'],
        message: 'External destinations must use HTTPS and contain no credentials.',
      });
    }

    if (
      destination.canonicalUrl !== undefined &&
      !isSafeHttpsUrl(destination.canonicalUrl)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['canonicalUrl'],
        message: 'Canonical URLs must use HTTPS and contain no credentials.',
      });
    }
  });

export const ProductSeoSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  indexable: z.boolean().default(true),
});

export const ProductStatusSchema = z.enum([
  'draft',
  'development',
  'beta',
  'active',
  'maintenance',
  'deprecated',
  'archived',
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
  aliases: z.array(z.string().min(1)).default([]),
  tags: z.array(z.string()).default([]),
  keywords: z.array(z.string().min(1)).default([]),
  capabilities: z.array(z.string()).default([]),
  supportedLocales: z.array(z.string().min(2)).default(['en']),
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
