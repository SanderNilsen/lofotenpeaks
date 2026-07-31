import { useEffect } from 'react';

const siteName = 'Lofoten Peaks';
const defaultDescription =
  'Lofoten Peaks is a practical guide to mountains, hiking trails, photos, weather, and maps in Lofoten, Norway.';
const defaultImage = '/images/homebanner.jpg';

function getAbsoluteUrl(path) {
  return new URL(path, window.location.origin).href;
}

function setMeta(selector, attributes) {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
}

function setCanonical(url) {
  let element = document.head.querySelector('link[rel="canonical"]');

  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }

  element.setAttribute('href', url);
}

function setStructuredData(serializedData) {
  const scriptId = 'lofoten-peaks-structured-data';
  let element = document.getElementById(scriptId);

  if (!serializedData) {
    element?.remove();
    return;
  }

  if (!element) {
    element = document.createElement('script');
    element.id = scriptId;
    element.type = 'application/ld+json';
    document.head.appendChild(element);
  }

  element.textContent = serializedData;
}

export function Seo({
  title,
  description = defaultDescription,
  image = defaultImage,
  imageAlt = 'Lofoten mountain landscape',
  type = 'website',
  canonicalPath,
  structuredData,
}) {
  const serializedStructuredData = structuredData ? JSON.stringify(structuredData) : '';

  useEffect(() => {
    const fullTitle = title ? `${title} | ${siteName}` : siteName;
    const absoluteImage = getAbsoluteUrl(image);
    const canonicalUrl = getAbsoluteUrl(canonicalPath ?? window.location.pathname);

    document.title = fullTitle;
    setCanonical(canonicalUrl);
    setStructuredData(serializedStructuredData);
    setMeta('meta[name="description"]', { name: 'description', content: description });
    setMeta('meta[name="robots"]', { name: 'robots', content: 'index, follow' });
    setMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: siteName });
    setMeta('meta[property="og:type"]', { property: 'og:type', content: type });
    setMeta('meta[property="og:title"]', { property: 'og:title', content: fullTitle });
    setMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    setMeta('meta[property="og:image"]', { property: 'og:image', content: absoluteImage });
    setMeta('meta[property="og:image:alt"]', { property: 'og:image:alt', content: imageAlt });
    setMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    setMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    setMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: fullTitle });
    setMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
    setMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: absoluteImage });
    setMeta('meta[name="twitter:image:alt"]', { name: 'twitter:image:alt', content: imageAlt });
  }, [canonicalPath, description, image, imageAlt, serializedStructuredData, title, type]);

  return null;
}
