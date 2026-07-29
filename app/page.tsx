import { supabase } from '@/lib/supabaseClient';
import { createClient as createServerSupabase } from '@/lib/supabase-server';
import ToolDashboard from "@/components/ToolDashboard";
import TrendingRow from "@/components/TrendingRow";
import FeaturedStacks from "@/components/FeaturedStacks";
import RecommendedRow from "@/components/RecommendedRow";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { Sparkles } from "lucide-react";
import { getPrimaryCategory } from "@/lib/constants";
import type { Tool, UserStack } from "@/lib/types";

interface SavedWithTags {
  tool_id: number;
  tools: { tags: string[] } | null;
}

// 🚨 CRITICAL CACHE OVERRIDE 🚨
// This forces Next.js to fetch fresh data from Supabase on every single page load.
// It guarantees that the moment your Python Harvester finds a new image, it appears here.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  // Fetch tools from DB - explicitly selecting EVERYTHING (*)
  const { data: tools, error } = await supabase
    .from('tools')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    console.error("Error fetching tools:", error);
  }

  // Trending row: tools flagged `featured` in Supabase. Falls back to top by
  // utility_score so the row isn't empty before anything is flagged.
  let trendingTools: Tool[] = [];
  const { data: featured, error: featuredError } = await supabase
    .from('tools')
    .select('*')
    .eq('featured', true)
    .order('utility_score', { ascending: false })
    .limit(5);

  if (!featuredError && featured && featured.length > 0) {
    trendingTools = featured;
  } else {
    trendingTools = [...(tools || [])]
      .sort((a, b) => (b.utility_score || 0) - (a.utility_score || 0))
      .slice(0, 5);
  }

  const { count: toolCount } = await supabase
    .from('tools')
    .select('*', { count: 'exact', head: true });

  // "Most Saved" sort data. Empty object pre-migration (saved_tools_counts view
  // won't exist yet) — sort just falls back to no-op ordering until it's run.
  const { data: saveCountRows } = await supabase
    .from('saved_tools_counts')
    .select('tool_id, save_count');

  const saveCounts: Record<number, number> = {};
  for (const row of saveCountRows || []) {
    saveCounts[row.tool_id] = row.save_count;
  }

  // Review stats (avg rating + count) per tool, for the rating badge on cards
  // and the "Top Rated" sort. Empty object pre-migration.
  const { data: reviewStatRows } = await supabase
    .from('tool_review_stats')
    .select('tool_id, avg_rating, review_count');

  const reviewStats: Record<number, { avg_rating: number; review_count: number }> = {};
  for (const row of reviewStatRows || []) {
    reviewStats[row.tool_id] = { avg_rating: row.avg_rating, review_count: row.review_count };
  }

  // Featured Stacks: public stacks with the most tools. No view for this —
  // pool is small enough to sort client-side after a bounded fetch.
  const { data: recentStacks } = await supabase
    .from('user_stacks')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(20)
    .returns<UserStack[]>();

  const featuredStacks = [...(recentStacks || [])]
    .sort((a, b) => b.tool_ids.length - a.tool_ids.length)
    .slice(0, 3);

  // Recommended For You: only for logged-in users with 3+ saved tools, ranked
  // by category overlap with what they've already saved. No placeholder if
  // logged out or under the threshold — the row just doesn't render.
  let recommendedTools: Tool[] = [];
  const serverSupabase = await createServerSupabase();
  const {
    data: { user },
  } = await serverSupabase.auth.getUser();

  if (user) {
    const { data: savedWithTags } = await serverSupabase
      .from('saved_tools')
      .select('tool_id, tools(tags)')
      .eq('user_id', user.id)
      .returns<SavedWithTags[]>();

    if (savedWithTags && savedWithTags.length >= 3) {
      const savedIds = new Set(savedWithTags.map((r) => r.tool_id));
      const savedCategories = new Set<string>();
      for (const row of savedWithTags) {
        const cat = getPrimaryCategory(row.tools?.tags);
        if (cat) savedCategories.add(cat);
      }

      if (savedCategories.size > 0) {
        recommendedTools = (tools || [])
          .filter((t) => !savedIds.has(t.id))
          .filter((t) =>
            t.tags?.some((tag: string) =>
              [...savedCategories].some((cat) => tag.toLowerCase().includes(cat.toLowerCase()))
            )
          )
          .sort((a, b) => (b.utility_score || 0) - (a.utility_score || 0))
          .slice(0, 6);
      }
    }
  }

  return (
    <main className="min-h-screen bg-black selection:bg-emerald-500/30 text-white overflow-x-hidden relative">
      
      {/* 1. BACKGROUND EFFECTS (The "Crazy" Look) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24 pb-20 flex flex-col items-center">
          
          {/* 3. HERO SECTION (Explains the tool) */}
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
                  <Sparkles className="w-3 h-3" /> Live Intelligence Engine
              </div>
              
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
                  AI Tool Hunter
              </h1>
              
              <p className="text-xl text-zinc-400 leading-relaxed">
                  Don&apos;t just search. <span className="text-white font-bold">Hunt.</span> <br className="hidden md:block"/>
                  Our AI Agent scans the live internet daily to find the Top 1% of tools that actually work.
              </p>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/60 border border-white/10 text-zinc-400 text-xs font-mono">
                  Discover <AnimatedCounter target={toolCount || 500} suffix="+" /> AI Tools
              </div>
          </div>

          {/* TRENDING THIS WEEK */}
          <TrendingRow tools={trendingTools} reviewStats={reviewStats} />

          {/* FEATURED STACKS */}
          <FeaturedStacks stacks={featuredStacks} />

          {/* RECOMMENDED FOR YOU */}
          <RecommendedRow tools={recommendedTools} reviewStats={reviewStats} />

          {/* 4. THE DASHBOARD (Your Grid & Search) */}
          <ToolDashboard tools={tools || []} saveCounts={saveCounts} reviewStats={reviewStats} />

      </div>
    </main>
  );
}
