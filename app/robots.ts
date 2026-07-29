import type { MetadataRoute } from 'next';

const BASE_URL = 'https://ai-tool-hunter.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/my-tools', '/api/'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
