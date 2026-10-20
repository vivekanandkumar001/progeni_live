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

    // Destination scheme check
    try {
      const urlObj = new URL(prod.destination.url);
      if (urlObj.protocol !== 'https:' && urlObj.protocol !== 'http:') {
        errors.push(`Product "${prod.slug}" destination has unsupported protocol "${urlObj.protocol}".`);
      }
      if (process.env.NODE_ENV === 'production' && urlObj.protocol !== 'https:') {
        warnings.push(`Product "${prod.slug}" uses non-HTTPS URL in production: ${prod.destination.url}`);
      }
    } catch {
      errors.push(`Product "${prod.slug}" has invalid destination URL: "${prod.destination.url}"`);
    }

    // Visibility warning
    if (prod.visibility === 'private' && prod.status === 'active') {
      warnings.push(`Product "${prod.slug}" is active but set to private.`);
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
