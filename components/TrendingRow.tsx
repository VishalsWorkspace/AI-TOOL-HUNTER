"use client";

import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { ToolCard } from "@/components/ToolCard";
import type { Tool } from "@/lib/types";

export default function TrendingRow({ tools }: { tools: Tool[] }) {
  const [items, setItems] = useState<Tool[]>(tools);
  const [votedTools, setVotedTools] = useState<number[]>([]);

  if (!items || items.length === 0) return null;

  const handleVote = async (toolId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (votedTools.includes(toolId)) return;

    setItems((prev) => prev.map((t) => (t.id === toolId ? { ...t, votes: (t.votes || 0) + 1 } : t)));
    setVotedTools((prev) => [...prev, toolId]);

    await supabase.rpc("increment_votes", { row_id: toolId });
  };

  return (
    <div className="w-full max-w-7xl mt-4 mb-8">
      <div className="flex items-center gap-2 mb-4 px-1">
        <TrendingUp className="h-5 w-5 text-emerald-500" />
        <h2 className="text-xl font-bold text-white">Trending This Week</h2>
      </div>
      <div
        className={
          "flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory " +
          "[&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:bg-zinc-800 " +
          "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
        }
      >
        {items.map((tool) => (
          <div key={tool.id} className="w-[300px] shrink-0 snap-start">
            <ToolCard tool={tool} handleVote={handleVote} hasVoted={votedTools.includes(tool.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}
