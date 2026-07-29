"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@/lib/useUser";
import { useSavedTools } from "@/components/SavedToolsProvider";
import { ToolCard, SkeletonCard } from "@/components/ToolCard";
import type { Tool } from "@/lib/types";

export default function MyToolsPage() {
  const { user, loading: userLoading } = useUser();
  const { savedIds, loading: savedLoading } = useSavedTools();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loadingTools, setLoadingTools] = useState(true);
  const [votedTools, setVotedTools] = useState<number[]>([]);

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
      const { data } = await supabase.from("tools").select("*").in("id", Array.from(savedIds));
      if (cancelled) return;
      setTools(data ?? []);
      setLoadingTools(false);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [user, savedIds, savedLoading]);

  const handleVote = async (toolId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (votedTools.includes(toolId)) return;

    setTools((prev) => prev.map((t) => (t.id === toolId ? { ...t, votes: (t.votes || 0) + 1 } : t)));
    setVotedTools((prev) => [...prev, toolId]);

    await supabase.rpc("increment_votes", { row_id: toolId });
  };

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
              <ToolCard
                key={tool.id}
                tool={tool}
                handleVote={handleVote}
                hasVoted={votedTools.includes(tool.id)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
