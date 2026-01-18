import { useEffect } from 'react';

interface MetaTags {
  title: string;
  description: string;
  image?: string;
  url?: string;
}

export const useMetaTags = (tags: MetaTags) => {
  useEffect(() => {
    // Set title
    document.title = tags.title + ' - Tin tức 24h';

    // Remove old OG tags
    const oldTags = document.querySelectorAll('meta[property^="og:"]');
    oldTags.forEach(tag => tag.remove());

    // Helper function to create meta tag
    const createMetaTag = (property: string, content: string) => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', property);
      meta.setAttribute('content', content);
      document.head.appendChild(meta);
    };

    // Add OG meta tags
    createMetaTag('og:title', tags.title);
    createMetaTag('og:description', tags.description);
    createMetaTag('og:url', tags.url || window.location.href);
    createMetaTag('og:type', 'article');
    createMetaTag('og:site_name', 'Tin tức 24h');

    if (tags.image) {
      createMetaTag('og:image', tags.image);
      createMetaTag('og:image:width', '1200');
      createMetaTag('og:image:height', '630');
    }

    // Twitter Card tags
    const createTwitterTag = (name: string, content: string) => {
      const meta = document.createElement('meta');
      meta.setAttribute('name', name);
      meta.setAttribute('content', content);
      document.head.appendChild(meta);
    };

    createTwitterTag('twitter:card', 'summary_large_image');
    createTwitterTag('twitter:title', tags.title);
    createTwitterTag('twitter:description', tags.description);
    if (tags.image) {
      createTwitterTag('twitter:image', tags.image);
    }

  }, [tags]);
};
