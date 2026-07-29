import { supabase } from '@/lib/supabaseClient';
import { Badge } from "@/components/ui/badge";
import { ExternalLink, BookOpen, CheckCircle2, ArrowLeft, Bot, Sparkles } from "lucide-react";
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import type { Tool } from '@/lib/types';
import { getPrimaryCategory } from '@/lib/constants';
import { BookmarkButton } from '@/components/BookmarkButton';
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

// --- PAGE COMPONENT ---
export default async function ToolPage({ params }: { params: { slug: string } }) {
  const { data: tool } = await supabase
    .from('tools')
    .select('*')
    .eq('slug', params.slug)
    .single<Tool>();

  if (!tool) return <div className="text-white text-center py-20">Tool not found</div>;

  const primaryCategory = getPrimaryCategory(tool.tags);

  const { data: candidatePool } = await supabase
    .from('tools')
    .select('*')
    .neq('id', tool.id)
    .order('utility_score', { ascending: false })
    .limit(40)
    .returns<Tool[]>();

  let similarTools: Tool[] = [];
  if (primaryCategory) {
    similarTools = (candidatePool || []).filter((t) =>
      t.tags?.some((tag) => tag.toLowerCase().includes(primaryCategory.toLowerCase()))
    );
  }
  if (similarTools.length === 0) {
    similarTools = candidatePool || [];
  }
  similarTools = similarTools.slice(0, 3);

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

        {/* HEADER */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-24 h-24 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-center shrink-0">
                {/* Fallback Icon */}
                <Bot className="h-12 w-12 text-emerald-500" />
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
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
                <p className="text-xl text-zinc-400 leading-relaxed">{tool.description}</p>

                <div className="flex flex-wrap gap-2 mt-4">
                    {tool.tags?.map((tag: string) => (
                        <span key={tag} className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-500 font-bold uppercase tracking-wider">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-auto">
                <div className="flex gap-2">
                    <a href={tool.link} target="_blank" rel="noopener noreferrer" className="flex-1 bg-white text-black font-bold py-3 px-8 rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
                        Visit Website <ExternalLink className="h-4 w-4" />
                    </a>
                    <BookmarkButton toolId={tool.id} className="h-[46px] w-[46px]" />
                </div>
                {tool.tutorial_link && (
                    <a
                        href={tool.tutorial_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-zinc-900 text-zinc-300 border border-zinc-800 font-bold py-2.5 px-8 rounded-xl hover:text-white hover:border-zinc-600 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                        <BookOpen className="h-4 w-4" /> Read Tutorial
                    </a>
                )}
                <div className="text-center text-xs text-zinc-500 font-mono">
                    Utility Score: {tool.utility_score}/10
                </div>
            </div>
        </div>

        <div className="w-full h-px bg-zinc-800 my-12" />

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            {/* LEFT: The Review */}
            <div className="md:col-span-2 prose prose-invert prose-emerald max-w-none">
                <h2 className="text-2xl font-bold mb-4 text-white">AI Analysis</h2>
                <div className="text-zinc-300 leading-7 space-y-4">
                    <ReactMarkdown>
                        {tool.content || "No review available yet."}
                    </ReactMarkdown>
                </div>
            </div>

            {/* RIGHT: Features */}
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

        <SimilarTools tools={similarTools} />

      </div>
    </div>
  );
}