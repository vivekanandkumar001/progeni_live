import { Product, Category } from '../registry/schemas';
import { getPublicProducts, getPublicCategories } from '../registry/selectors';

export interface SearchResult {
  product: Product;
  score: number;
  matchedField: 'name' | 'tag' | 'capability' | 'category' | 'description' | 'all';
}

export interface SearchOptions {
  categorySlug?: string;
  minScore?: number;
}

/**
 * Normalizes text for search indexing and querying:
 * Lowercases, trims extra spaces, removes punctuation noise.
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Searches public products with intelligent weighted relevance ranking.
 */
export function searchCatalog(
  query: string,
  options: SearchOptions = {}
): SearchResult[] {
  const normQuery = normalizeText(query);
  const publicProducts = getPublicProducts();
  const publicCategories = getPublicCategories();

  // Create a quick lookup map of category ID to category
  const categoryMap = new Map<string, Category>();
  for (const cat of publicCategories) {
    categoryMap.set(cat.id, cat);
  }

  // Filter by category if specified
  let targetProducts = publicProducts;
  if (options.categorySlug && options.categorySlug !== 'all') {
    const targetCat = publicCategories.find(
      (c) => c.slug.toLowerCase() === options.categorySlug?.toLowerCase()
    );
    if (!targetCat) {
      // Unknown categories match nothing, rather than degrading to "all".
      return [];
    }
    targetProducts = targetProducts.filter((p) =>
      p.categoryIds.includes(targetCat.id)
    );
  }

  // If query is empty, return products in default sortOrder with base score
  if (!normQuery) {
    return targetProducts.map((p) => ({
      product: p,
      score: 100 - p.sortOrder,
      matchedField: 'all',
    }));
  }

  const queryTokens = normQuery.split(' ').filter(Boolean);
  const results: SearchResult[] = [];

  for (const product of targetProducts) {
    let score = 0;
    let matchedField: SearchResult['matchedField'] = 'description';

    const normName = normalizeText(product.name);
    const normSlug = normalizeText(product.slug);
    const normDesc = normalizeText(
      `${product.shortDescription} ${product.description || ''}`
    );
    const normTags = product.tags.map(normalizeText);
    const normCapabilities = product.capabilities.map(normalizeText);
    const productCategoryNames = product.categoryIds
      .map((id) => categoryMap.get(id)?.name || '')
      .map(normalizeText);

    // 1. Exact name / slug match (highest priority: 1000 pts)
    if (normName === normQuery || normSlug === normQuery) {
      score += 1000;
      matchedField = 'name';
    }
    // 2. Name starts with query (500 pts)
    else if (normName.startsWith(normQuery) || normSlug.startsWith(normQuery)) {
      score += 500;
      matchedField = 'name';
    }
    // 3. Name contains full query phrase (300 pts)
    else if (normName.includes(normQuery)) {
      score += 300;
      matchedField = 'name';
    }

    // 4. Check Tags
    let tagMatched = false;
    for (const tag of normTags) {
      if (tag === normQuery) {
        score += 250;
        tagMatched = true;
      } else if (tag.includes(normQuery)) {
        score += 120;
        tagMatched = true;
      }
    }
    if (tagMatched && matchedField !== 'name') {
      matchedField = 'tag';
    }

    // 5. Check Capabilities
    let capMatched = false;
    for (const cap of normCapabilities) {
      if (cap.includes(normQuery)) {
        score += 80;
        capMatched = true;
      }
    }
    if (capMatched && matchedField !== 'name' && matchedField !== 'tag') {
      matchedField = 'capability';
    }

    // 6. Check Categories
    let catMatched = false;
    for (const catName of productCategoryNames) {
      if (catName.includes(normQuery)) {
        score += 60;
        catMatched = true;
      }
    }
    if (catMatched && matchedField === 'description') {
      matchedField = 'category';
    }

    // 7. Check Description
    if (normDesc.includes(normQuery)) {
      score += 40;
    }

    // 8. Multi-token partial matches
    let tokenMatches = 0;
    for (const token of queryTokens) {
      if (
        normName.includes(token) ||
        normTags.some((t) => t.includes(token)) ||
        normCapabilities.some((c) => c.includes(token)) ||
        normDesc.includes(token)
      ) {
        tokenMatches++;
        score += 25;
      }
    }

    // Bonus if all query tokens matched somewhere
    if (queryTokens.length > 1 && tokenMatches === queryTokens.length) {
      score += 100;
    }

    // Boost featured products slightly for tie-breaking
    if (product.featured) {
      score += 5;
    }

    // Deduct slightly by sortOrder to break ties stably
    score -= product.sortOrder * 0.1;

    if (score > (options.minScore ?? 10)) {
      results.push({
        product,
        score,
        matchedField,
      });
    }
  }

  // Sort descending by score
  results.sort((a, b) => b.score - a.score);

  return results;
}
