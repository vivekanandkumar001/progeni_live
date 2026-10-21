import { useLayoutEffect } from 'react';

export interface SeoProps {
  title: string;
  description: string;
  canonicalPath?: string;
  ogType?: 'website' | 'article';
  /** Defaults to 'index,follow'. Set to 'noindex,follow' for soft-404 pages. */
  robots?: string;
}

const BASE_URL = 'https://progeni.live';
const JSONLD_ID = 'progeni-jsonld';

/**
 * Injects (or replaces) a single JSON-LD block in <head>.
 *
 * Google reads JSON-LD to build rich results (sitelinks search box, breadcrumb
 * trails, app cards). One block per page is kept so repeated navigations do
 * not accumulate duplicate scripts, which Google treats as invalid markup.
 *
 * Pass a pre-serialised JSON string, or `null` to remove the block.
 */
export function setJsonLd(json: string | null) {
  let script = document.getElementById(JSONLD_ID) as HTMLScriptElement | null;
  if (json === null) {
    script?.remove();
    return;
  }
  if (!script) {
    script = document.createElement('script');
    script.id = JSONLD_ID;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = json;
}

export function updatePageSeo({
  title,
  description,
  canonicalPath = '',
  ogType = 'website',
  robots = 'index,follow',
}: SeoProps) {
  // Update Title
  const formattedTitle = title.includes('Progeni') ? title : `${title} — Progeni`;
  document.title = formattedTitle;

  // Update Meta Description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', description);

  // Update Robots (soft-404 pages must not be indexed)
  let metaRobots = document.querySelector('meta[name="robots"]');
  if (!metaRobots) {
    metaRobots = document.createElement('meta');
    metaRobots.setAttribute('name', 'robots');
    document.head.appendChild(metaRobots);
  }
  metaRobots.setAttribute('content', robots);

  // Update Canonical URL
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  const cleanPath = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
  canonicalLink.setAttribute('href', `${BASE_URL}${cleanPath === '/' ? '' : cleanPath}`);

  // Update OpenGraph tags
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', formattedTitle);

  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) ogDescription.setAttribute('content', description);

  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.setAttribute('content', `${BASE_URL}${cleanPath}`);

  const ogTypeMeta = document.querySelector('meta[property="og:type"]');
  if (ogTypeMeta) ogTypeMeta.setAttribute('content', ogType);

  // Twitter/X mirrors og:title & og:description for the card preview.
  const twitterTitle = document.querySelector('meta[name="twitter:title"]');
  if (twitterTitle) twitterTitle.setAttribute('content', formattedTitle);

  const twitterDescription = document.querySelector('meta[name="twitter:description"]');
  if (twitterDescription) twitterDescription.setAttribute('content', description);

  const twitterUrl = document.querySelector('meta[name="twitter:url"]');
  if (twitterUrl) twitterUrl.setAttribute('content', `${BASE_URL}${cleanPath}`);
}

/**
 * React hook to set SEO tags declaratively.
 *
 * Uses `useLayoutEffect` (not `useEffect`) on purpose: passive effects are
 * deferred by React until after the browser has painted, which leaves a window
 * where the DOM shows the correct page but <title>, <meta description> and
 * <link rel=canonical> still hold the previous route's values. Crawlers and
 * link-preview scrapers that snapshot the head during that window would
 * otherwise read (and index) the wrong canonical URL.
 */
export function useSeo(props: SeoProps) {
  useLayoutEffect(() => {
    updatePageSeo(props);
    // Drop any structured data left behind by the previous route. Pages that
    // do provide JSON-LD call useJsonLd() immediately after useSeo(), so the
    // two effects always run in that order and the fresh block is written
    // straight back.
    setJsonLd(null);
  }, [props.title, props.description, props.canonicalPath, props.ogType, props.robots]);
}

/**
 * Emits a JSON-LD structured data block for the current page.
 *
 * Serialised up front so the effect only re-runs when the payload actually
 * changes, and removed entirely when a page has no structured data to offer.
 */
export function useJsonLd(data: Record<string, unknown> | null) {
  const serialized = data === null ? null : JSON.stringify(data);
  useLayoutEffect(() => {
    setJsonLd(serialized);
  }, [serialized]);
}
