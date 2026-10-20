import { useEffect } from 'react';

export interface SeoProps {
  title: string;
  description: string;
  canonicalPath?: string;
  ogType?: 'website' | 'article';
}

const BASE_URL = 'https://progeni.live';

export function updatePageSeo({
  title,
  description,
  canonicalPath = '',
  ogType = 'website',
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
}

/**
 * React hook to set SEO tags declaratively
 */
export function useSeo(props: SeoProps) {
  useEffect(() => {
    updatePageSeo(props);
  }, [props.title, props.description, props.canonicalPath, props.ogType]);
}
