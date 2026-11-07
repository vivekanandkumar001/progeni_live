import { ProductSchema, CategorySchema, Product, Category } from './schemas';
import productsData from './products.json';
import categoriesData from './categories.json';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  productCount: number;
  categoryCount: number;
}

function destinationKey(destination: Product['destination']): string {
  const url =
    destination.type === 'path'
      ? new URL(destination.url, 'https://progeni.live')
      : new URL(destination.url);
  const pathname = url.pathname.replace(/\/+$/, '') || '/';
  return `${url.origin}${pathname}`.toLowerCase();
}

export function validateRegistry(
  products: unknown[] = productsData,
  categories: unknown[] = categoriesData
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const parsedCategories: Category[] = [];
  const categoryIds = new Set<string>();
  const categorySlugs = new Set<string>();

  // 1. Validate categories
  if (!Array.isArray(categories)) {
    return {
      valid: false,
      errors: ['Categories data must be an array.'],
      warnings: [],
      productCount: 0,
      categoryCount: 0,
    };
  }

  for (let i = 0; i < categories.length; i++) {
    const rawCat = categories[i];
    const parseRes = CategorySchema.safeParse(rawCat);
    if (!parseRes.success) {
      errors.push(`Category at index ${i} failed schema validation: ${parseRes.error.message}`);
      continue;
    }

    const cat = parseRes.data;
    if (categoryIds.has(cat.id)) {
      errors.push(`Duplicate category id "${cat.id}" detected.`);
    } else {
      categoryIds.add(cat.id);
    }

    if (categorySlugs.has(cat.slug)) {
      errors.push(`Duplicate category slug "${cat.slug}" detected.`);
    } else {
      categorySlugs.add(cat.slug);
    }

    parsedCategories.push(cat);
  }

  // 2. Validate products
  if (!Array.isArray(products)) {
    return {
      valid: false,
      errors: ['Products data must be an array.', ...errors],
      warnings,
      productCount: 0,
      categoryCount: parsedCategories.length,
    };
  }

  const parsedProducts: Product[] = [];
  const productIds = new Set<string>();
  const productSlugs = new Set<string>();
  const productDestinations = new Map<string, string>();

  for (let i = 0; i < products.length; i++) {
    const rawProd = products[i];
    const parseRes = ProductSchema.safeParse(rawProd);
    if (!parseRes.success) {
      errors.push(`Product at index ${i} failed schema validation: ${parseRes.error.message}`);
      continue;
    }

    const prod = parseRes.data;

    // Duplicate ID check
    if (productIds.has(prod.id)) {
      errors.push(`Duplicate product id "${prod.id}" detected.`);
    } else {
      productIds.add(prod.id);
    }

    // Duplicate slug check
    if (productSlugs.has(prod.slug)) {
      errors.push(`Duplicate product slug "${prod.slug}" detected.`);
    } else {
      productSlugs.add(prod.slug);
    }

    // Category reference check
    for (const catId of prod.categoryIds) {
      if (!categoryIds.has(catId)) {
        errors.push(`Product "${prod.slug}" references nonexistent category ID "${catId}".`);
      }
    }

    const urls = [
      prod.destination.url,
      ...(prod.destination.canonicalUrl ? [prod.destination.canonicalUrl] : []),
    ];
    for (const value of urls) {
      const destination = {
        ...prod.destination,
        url: value,
        type: value === prod.destination.url ? prod.destination.type : 'external',
      } as Product['destination'];
      const key = destinationKey(destination);
      const existingSlug = productDestinations.get(key);
      if (existingSlug && existingSlug !== prod.slug) {
        errors.push(
          `Product "${prod.slug}" conflicts with "${existingSlug}" at destination "${value}".`
        );
      } else {
        productDestinations.set(key, prod.slug);
      }
    }

    // Visibility warning
    if (prod.visibility === 'private' && prod.status === 'active') {
      warnings.push(`Product "${prod.slug}" is active but set to private.`);
    }
    if (prod.visibility === 'public' && ['draft', 'archived'].includes(prod.status)) {
      warnings.push(`Product "${prod.slug}" is ${prod.status} and will not appear in public discovery.`);
    }

    parsedProducts.push(prod);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    productCount: parsedProducts.length,
    categoryCount: parsedCategories.length,
  };
}
