import { Product, Category } from './schemas';
import productsData from './products.json';
import categoriesData from './categories.json';

const products = productsData as Product[];
const categories = categoriesData as Category[];

/**
 * Returns all public products permitted to appear in directories, search, and home.
 */
export function getPublicProducts(): Product[] {
  return products
    .filter((p) => p.visibility === 'public' && p.status !== 'deprecated')
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Returns featured public products for hero/home showcases.
 */
export function getFeaturedProducts(): Product[] {
  return getPublicProducts().filter((p) => p.featured);
}

/**
 * Resolves a product by slug.
 * Supports public and unlisted (unlisted products are accessible via direct link, but hidden from search/directory).
 * Private products are never returned.
 */
export function getProductBySlug(slug: string): Product | undefined {
  const prod = products.find((p) => p.slug.toLowerCase() === slug.toLowerCase());
  if (!prod || prod.visibility === 'private') {
    return undefined;
  }
  return prod;
}

/**
 * Returns recently launched public products based on creation date.
 */
export function getRecentlyLaunched(limit = 6): Product[] {
  return getPublicProducts()
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

/**
 * Returns all public categories.
 */
export function getPublicCategories(): Category[] {
  return categories
    .filter((c) => c.visibility === 'public')
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Returns a category by its slug.
 */
export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug.toLowerCase() === slug.toLowerCase() && c.visibility === 'public');
}

/**
 * Returns categories that have at least one active public tool, with accurate counts.
 */
export function getCategoriesWithCounts(): Array<Category & { count: number }> {
  const publicProds = getPublicProducts();
  const publicCats = getPublicCategories();

  return publicCats.map((cat) => {
    const count = publicProds.filter((p) => p.categoryIds.includes(cat.id)).length;
    return {
      ...cat,
      count,
    };
  });
}

/**
 * Returns public products belonging to a given category slug.
 */
export function getProductsByCategorySlug(categorySlug: string): Product[] {
  const category = getCategoryBySlug(categorySlug);
  if (!category) return [];

  return getPublicProducts().filter((p) => p.categoryIds.includes(category.id));
}
