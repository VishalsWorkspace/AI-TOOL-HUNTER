import { cache } from 'react';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowLeft, Bot, Video, Sparkles, MessageSquare, Bookmark as BookmarkIcon } from "lucide-react";
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import type { Tool } from '@/lib/types';
import { classifyPricing, getPrimaryCategory } from '@/lib/constants';
import { ToolDetailActions } from '@/components/ToolDetailActions';
import { StarRating } from '@/components/StarRating';
import { ReviewForm } from '@/components/ReviewForm';
import { ReviewsList } from '@/components/ReviewsList';
import SimilarTools from '@/components/SimilarTools';

export const revalidate = 60; // Update every minute

// --- FIX: ROBUST STATIC PARAMS ---
// This prevents the "slug not provided" build error
export async function generateStaticParams() {
  const { data: tools } = await supabase.from('tools').select('slug');

  if (!tools) return [];

  return tools
    .filter((tool) => tool.slug) // 1. Filter out null/empty slugs
    .map((tool) => ({
      slug: String(tool.slug),   // 2. Force convert to string
    }));
}

// Deduped per-request via React.cache — generateMetadata and the page
// component both need the tool, this way it's only fetched once.
const getTool = cache(async (slug: string) => {
  const { data } = await supabase.from('tools').select('*').eq('slug', slug).single<Tool>();
  return data;
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getTool(slug);
  if (!tool) return { title: 'Tool not found' };

  return {
    title: tool.title,
    description: tool.description,
    openGraph: {
      title: tool.title,
      description: tool.description,
      images: tool.image_url ? [{ url: tool.image_url }] : undefined,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: tool.title,
      description: tool.description,
      images: tool.image_url ? [tool.image_url] : undefined,
    },
  };
}

// --- HERO IMAGE (same 3-stage fallback as ToolCard, kept local/duplicated
// rather than shared — that image logic has a history of subtle bugs
// (see git log) and this hero variant has different sizing/crop needs, so
// a shared abstraction risks regressing either usage under time pressure. ---
function HeroImage({ tool }: { tool: Tool }) {
  const imageUrl = tool.image_url;
  let src = "";
  if (imageUrl) {
    let absoluteUrl = imageUrl;
    if (!imageUrl.startsWith("http://") && !imageUrl.startsWith("https://")) {
      try {
        absoluteUrl = `${new URL(tool.link).origin}${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`;
      } catch {
        absoluteUrl = "";
      }
    }
    if (absoluteUrl) {
      src = `https://wsrv.nl/?url=${encodeURIComponent(absoluteUrl.replace(/^http:\/\//i, "https://"))}&w=400&h=400&fit=cover&output=webp`;
    }
  }

  if (!src) {
    try {
      const domain = new URL(tool.link).hostname.replace(/^www\./, "");
      src = `https://logo.clearbit.com/${domain}`;
    } catch {
      src = "";
    }
  }

  return (
    <div className="w-28 h-28 md:w-32 md:h-32 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={tool.title} className="w-full h-full object-contain p-4" />
      ) : tool.tags?.some((t) => t.includes("Video")) ? (
        <Video className="h-12 w-12 text-emerald-500" />
      ) : (
        <Bot className="h-12 w-12 text-emerald-500" />
      )}
    </div>
  );
}

// --- PAGE COMPONENT ---
export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = await getTool(slug);

  if (!tool) return <div className="text-white text-center py-20">Tool not found</div>;

  const primaryCategory = getPrimaryCategory(tool.tags);
  const isPaid = classifyPricing(tool.pricing) === 'PAID';

  const { data: candidatePool } = await supabase
    .from('tools')
    .select('*')
    .neq('id', tool.id)
    .order('utility_score', { ascending: false })
    .limit(40)
    .returns<Tool[]>();

  const pool = candidatePool || [];
  const sameCategoryPool = primaryCategory
    ? pool.filter((t) => t.tags?.some((tag) => tag.toLowerCase().includes(primaryCategory.toLowerCase())))
    : [];

  let alternativesTitle = 'Similar Tools';
  let alternatives = sameCategoryPool.length > 0 ? sameCategoryPool : pool;

  if (isPaid) {
    const freeAlts = sameCategoryPool.filter((t) => classifyPricing(t.pricing) === 'FREE');
    if (freeAlts.length > 0) {
      alternativesTitle = 'Free Alternatives';
      alternatives = freeAlts;
    }
  }
  alternatives = alternatives.slice(0, 3);

  const [{ data: reviews }, { data: statsRow }, { data: saveCountRow }] = await Promise.all([
    supabase.from('tool_reviews').select('*').eq('tool_id', tool.id).order('created_at', { ascending: false }),
    supabase.from('tool_review_stats').select('*').eq('tool_id', tool.id).maybeSingle(),
    supabase.from('saved_tools_counts').select('*').eq('tool_id', tool.id).maybeSingle(),
  ]);

  const avgRating = statsRow?.avg_rating ?? 0;
  const reviewCount = statsRow?.review_count ?? 0;
  const timesSaved = saveCountRow?.save_count ?? 0;

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Aurora Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-10">
        <Link href="/" className="inline-flex items-center text-zinc-500 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Hunter
        </Link>

        {/* HERO */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
            <HeroImage tool={tool} />
            <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h1 className="text-4xl font-bold">{tool.title}</h1>
                    {primaryCategory && (
                        <Badge variant="outline" className="border-cyan-500/50 text-cyan-400 bg-cyan-900/20">
                            {primaryCategory}
                        </Badge>
                    )}
                    <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 bg-emerald-900/20">
                        {tool.pricing || "Free"}
                    </Badge>
                </div>
                <div className="flex items-center gap-2 mb-4">
                    <StarRating rating={tool.utility_score / 20} size="md" />
                    <span className="text-xs text-zinc-500 font-mono">Utility Score: {tool.utility_score}/100</span>
                </div>
                <p className="text-xl text-zinc-400 leading-relaxed">{tool.description}</p>

                <div className="flex flex-wrap gap-2 mt-4">
                    {tool.tags?.map((tag: string) => (
                        <Link
                            key={tag}
                            href={`/?q=${encodeURIComponent(tag)}`}
                            className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-500 font-bold uppercase tracking-wider hover:text-emerald-400 hover:border-emerald-500/40 transition-colors"
                        >
                            {tag}
                        </Link>
                    ))}
                </div>
            </div>

            <ToolDetailActions tool={tool} />
        </div>

        {/* STATS BAR */}
        <div className="grid grid-cols-3 gap-4 mt-8 bg-zinc-900/30 border border-zinc-800 rounded-2xl p-4">
            <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-2xl font-bold text-white">
                    <Sparkles className="h-4 w-4 text-yellow-400" /> {avgRating > 0 ? avgRating.toFixed(1) : "—"}
                </div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Avg Rating</p>
            </div>
            <div className="text-center border-x border-zinc-800">
                <div className="flex items-center justify-center gap-1.5 text-2xl font-bold text-white">
                    <MessageSquare className="h-4 w-4 text-emerald-500" /> {reviewCount}
                </div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Reviews</p>
            </div>
            <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-2xl font-bold text-white">
                    <BookmarkIcon className="h-4 w-4 text-cyan-400" /> {timesSaved}
                </div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Times Saved</p>
            </div>
        </div>

        <div className="w-full h-px bg-zinc-800 my-12" />

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

            {/* LEFT: About + AI Analysis */}
            <div className="md:col-span-2 space-y-10">
                <div>
                    <h2 className="text-2xl font-bold mb-4 text-white">About</h2>
                    <p className="text-zinc-300 leading-7">{tool.description}</p>
                </div>

                {tool.content && (
                    <div className="prose prose-invert prose-emerald max-w-none">
                        <h2 className="text-2xl font-bold mb-4 text-white">AI Analysis</h2>
                        <div className="text-zinc-300 leading-7 space-y-4">
                            <ReactMarkdown>{tool.content}</ReactMarkdown>
                        </div>
                    </div>
                )}
            </div>

            {/* RIGHT: Pros */}
            <div className="space-y-8">
                <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-emerald-500" /> Key Features
                    </h3>
                    <ul className="space-y-3">
                        {tool.pros?.map((pro: string, i: number) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-zinc-400">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                {pro}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>

        <SimilarTools tools={alternatives} title={alternativesTitle} />

        {/* REVIEWS */}
        <div className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-6">Reviews</h2>
            <div className="mb-8">
                <ReviewForm toolId={tool.id} />
            </div>
            <ReviewsList reviews={reviews || []} />
        </div>

      </div>
    </div>
  );
}
