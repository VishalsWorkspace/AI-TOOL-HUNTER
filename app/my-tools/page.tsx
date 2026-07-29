"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, ArrowLeft, Layers, Plus, Lock, Globe } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { createClient } from "@/lib/supabase";
import { useUser } from "@/lib/useUser";
import { useSavedTools } from "@/components/SavedToolsProvider";
import { ToolCard, SkeletonCard } from "@/components/ToolCard";
import { CreateStackModal } from "@/components/CreateStackModal";
import type { ReviewStats, Tool, UserStack } from "@/lib/types";

export default function MyToolsPage() {
  const { user, loading: userLoading } = useUser();
  const { savedIds, loading: savedLoading } = useSavedTools();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loadingTools, setLoadingTools] = useState(true);
  const [reviewStats, setReviewStats] = useState<Record<number, ReviewStats>>({});
  const [stacks, setStacks] = useState<UserStack[]>([]);
  const [loadingStacks, setLoadingStacks] = useState(true);
  const [showCreateStack, setShowCreateStack] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!user || savedLoading) {
        if (!cancelled) setLoadingTools(false);
        return;
      }

      if (savedIds.size === 0) {
        if (!cancelled) {
          setTools([]);
          setLoadingTools(false);
        }
        return;
      }

      setLoadingTools(true);
      const ids = Array.from(savedIds);
      const [{ data }, { data: statsRows }] = await Promise.all([
        supabase.from("tools").select("*").in("id", ids),
        supabase.from("tool_review_stats").select("tool_id, avg_rating, review_count").in("tool_id", ids),
      ]);
      if (cancelled) return;
      setTools(data ?? []);
      const statsMap: Record<number, ReviewStats> = {};
      for (const row of statsRows ?? []) {
        statsMap[row.tool_id] = { avg_rating: row.avg_rating, review_count: row.review_count };
      }
      setReviewStats(statsMap);
      setLoadingTools(false);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [user, savedIds, savedLoading]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!user) {
        if (!cancelled) setLoadingStacks(false);
        return;
      }

      setLoadingStacks(true);
      const sb = createClient();
      const { data } = await sb
        .from("user_stacks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (cancelled) return;
      setStacks(data ?? []);
      setLoadingStacks(false);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <main className="min-h-screen bg-black text-white px-4 pb-20">
      <div className="max-w-7xl mx-auto pt-12">
        <Link href="/" className="inline-flex items-center text-zinc-500 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Hunter
        </Link>

        <div className="flex items-center gap-3 mb-10">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Bookmark className="h-5 w-5 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold">My Saved Tools</h1>
        </div>

        {userLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : !user ? (
          <div className="text-center py-24">
            <p className="text-xl text-zinc-400 mb-2">You need to be logged in to see your saved tools.</p>
            <p className="text-zinc-600">Use the Login with Google button in the navbar.</p>
          </div>
        ) : loadingTools || savedLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : tools.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-xl text-zinc-400 mb-2">You haven&apos;t saved any tools yet.</p>
            <Link href="/" className="text-emerald-400 hover:underline">
              Go find something worth bookmarking →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} reviewStats={reviewStats[tool.id]} />
            ))}
          </div>
        )}

        {/* MY STACKS */}
        {user && (
          <div id="stacks" className="mt-20 scroll-mt-24">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                  <Layers className="h-5 w-5 text-cyan-400" />
                </div>
                <h2 className="text-3xl font-bold">My Stacks</h2>
              </div>
              <button
                onClick={() => setShowCreateStack(true)}
                className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm px-4 py-2.5 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" /> Create Stack
              </button>
            </div>

            {loadingStacks ? (
              <p className="text-zinc-600 text-sm">Loading stacks...</p>
            ) : stacks.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl">
                <p className="text-zinc-500 mb-1">You haven&apos;t created any stacks yet.</p>
                <p className="text-zinc-700 text-sm">Bundle your saved tools into a shareable workflow.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stacks.map((stack) => (
                  <Link
                    key={stack.id}
                    href={`/stack/${stack.slug}`}
                    className="block bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 hover:border-cyan-500/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-white">{stack.name}</h3>
                      {stack.is_public ? (
                        <Globe className="h-4 w-4 text-emerald-500 shrink-0 mt-1" />
                      ) : (
                        <Lock className="h-4 w-4 text-zinc-600 shrink-0 mt-1" />
                      )}
                    </div>
                    {stack.description && <p className="text-sm text-zinc-500 mb-3 line-clamp-2">{stack.description}</p>}
                    <p className="text-xs text-zinc-600 font-mono">{stack.tool_ids.length} tools</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showCreateStack && <CreateStackModal tools={tools} onClose={() => setShowCreateStack(false)} />}
    </main>
  );
}
