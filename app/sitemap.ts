import type { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabaseClient';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-tool-hunter-eight.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: tools } = await supabase.from('tools').select('slug, created_at');

  const toolUrls: MetadataRoute.Sitemap = (tools || []).map((t) => ({
    url: `${BASE_URL}/tool/${t.slug}`,
    lastModified: t.created_at ? new Date(t.created_at) : undefined,
  }));

  return [
    { url: BASE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/compare`, priority: 0.5 },
    ...toolUrls,
  ];
}
