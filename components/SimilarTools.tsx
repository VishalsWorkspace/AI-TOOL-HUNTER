"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { ToolCard } from "@/components/ToolCard";
import type { Tool } from "@/lib/types";

export default function SimilarTools({ tools }: { tools: Tool[] }) {
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
    <div className="mt-16">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="h-5 w-5 text-emerald-500" />
        <h2 className="text-2xl font-bold text-white">Similar Tools</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((tool) => (
          <ToolCard key={tool.id} tool={tool} handleVote={handleVote} hasVoted={votedTools.includes(tool.id)} />
        ))}
      </div>
    </div>
  );
}
