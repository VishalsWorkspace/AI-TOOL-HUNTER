import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-tool-hunter-eight.vercel.app';

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
