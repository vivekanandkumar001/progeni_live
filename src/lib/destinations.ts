import { Product } from '../registry/schemas';

export interface DestinationResolution {
  url: string;
  isExternal: boolean;
  target?: '_blank';
  rel?: 'noopener noreferrer';
  displayText: string;
}

/**
 * Safely resolves product destination attributes for anchor links or navigations.
 */
export function resolveDestination(product: Product): DestinationResolution {
  const { type, url } = product.destination;

  // Relative path destinations (integrated tools) are internal by definition.
  if (type === 'path' && url.startsWith('/')) {
    return {
      url,
      isExternal: false,
      displayText: `Open ${product.name}`,
    };
  }

  // Strict URL safety check: ensure scheme is http: or https:
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
    if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
      throw new Error('Unsupported protocol');
    }
  } catch {
    // Fallback safe fallback to product detail page if url was malformed
    return {
      url: `/tools/${product.slug}`,
      isExternal: false,
      displayText: 'View Tool Details',
    };
  }

  if (type === 'subdomain' || type === 'external') {
    return {
      url,
      isExternal: true,
      target: '_blank',
      rel: 'noopener noreferrer',
      displayText: `Launch ${product.name}`,
    };
  }

  // Integrated path
  return {
    url,
    isExternal: false,
    displayText: `Open ${product.name}`,
  };
}
