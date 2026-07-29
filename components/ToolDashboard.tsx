"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, Zap, Clock, Bookmark, ArrowDownAZ } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from '@/lib/supabaseClient';
import type { Tool } from "@/lib/types";
import { CATEGORIES, PRICING_FILTERS, classifyPricing, tokenizeQuery, USE_CASE_CHIPS, type PricingFilter } from "@/lib/constants";
import { ToolCard, SkeletonCard } from "@/components/ToolCard";

type SortOption = "newest" | "mostSaved" | "alphabetical";

const SORT_OPTIONS: { value: SortOption; label: string; icon: typeof Clock }[] = [
  { value: "newest", label: "Newest", icon: Clock },
  { value: "mostSaved", label: "Most Saved", icon: Bookmark },
  { value: "alphabetical", label: "A–Z", icon: ArrowDownAZ },
];

// --- MAIN DASHBOARD ---

export default function ToolDashboard({
  tools: initialTools,
  saveCounts = {},
}: {
  tools: Tool[];
  saveCounts?: Record<number, number>;
}) {
  const [allTools, setAllTools] = useState<Tool[]>(initialTools);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPricing, setSelectedPricing] = useState<PricingFilter>("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [isHunting, setIsHunting] = useState(false);
  const [votedTools, setVotedTools] = useState<number[]>([]);

  const toggleCategory = (cat: string) => {
    if (cat === "All") {
      setSelectedCategories([]);
      return;
    }
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const filteredTools = useMemo(() => {
    const tokens = tokenizeQuery(searchQuery);

    return allTools.filter((tool) => {
      const matchesSearch = tokens.length === 0 || tokens.some((tok) =>
                            tool.title.toLowerCase().includes(tok) ||
                            tool.description.toLowerCase().includes(tok) ||
                            (tool.tags?.some(t => t.toLowerCase().includes(tok))));

      const matchesCategory = selectedCategories.length === 0 ||
                              (tool.tags?.some(tag => selectedCategories.some(cat => tag.includes(cat))));

      const matchesPricing = selectedPricing === "ALL" || classifyPricing(tool.pricing) === selectedPricing;

      return matchesSearch && matchesCategory && matchesPricing;
    });
  }, [allTools, searchQuery, selectedCategories, selectedPricing]);

  const sortedTools = useMemo(() => {
    const arr = [...filteredTools];
    if (sortBy === "alphabetical") {
      arr.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "mostSaved") {
      arr.sort((a, b) => (saveCounts[b.id] || 0) - (saveCounts[a.id] || 0));
    }
    // "newest" keeps server order (tools arrive ordered by id desc)
    return arr;
  }, [filteredTools, sortBy, saveCounts]);

  const handleDeepHunt = async () => {
    if (!searchQuery) return;
    setIsHunting(true);
    try {
      const res = await fetch('/api/hunt', {
        method: 'POST',
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      
      if (data.success && data.tools.length > 0) {
        const newTools = data.tools.map((t: Tool) => ({ ...t, id: Date.now() + Math.random() })); 
        
        setAllTools(prev => {
            const combined = [...newTools, ...prev];
            return combined.filter((tool, index, self) =>
                index === self.findIndex((t) => t.title === tool.title)
            );
        });
        setSelectedCategories([]);
      }
    } catch (e) { 
      console.error(e); 
    } finally {
      setIsHunting(false);
    }
  };

  const handleVote = async (toolId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (votedTools.includes(toolId)) return;

    setAllTools(prev => prev.map(t => t.id === toolId ? { ...t, votes: (t.votes || 0) + 1 } : t));
    setVotedTools(prev => [...prev, toolId]);

    await supabase.rpc('increment_votes', { row_id: toolId });
  };

  return (
    <div className="w-full flex flex-col items-center pb-20 px-4">
      
      {/* Search Input */}
      <div className="mt-12 w-full max-w-xl relative group z-20">
         <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
         <div className="relative flex items-center bg-black rounded-xl border border-white/10">
           <Search className="ml-4 h-5 w-5 text-zinc-500" />
           <input
             className="flex-1 bg-transparent border-none px-4 py-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-0 text-lg"
             placeholder="Try: &quot;I want to generate images from text&quot;..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && handleDeepHunt()}
           />
           <Button
             onClick={handleDeepHunt}
             disabled={isHunting}
             className="mr-2 bg-zinc-900 text-white hover:bg-zinc-800 border border-zinc-800"
           >
             {isHunting ? "Hunting..." : "Deep Search"}
           </Button>
         </div>
      </div>

      {/* Use Case Chips */}
      {!searchQuery && (
        <div className="mt-4 flex flex-wrap gap-2 justify-center max-w-2xl z-10">
          {USE_CASE_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => setSearchQuery(chip)}
              className="px-3 py-1.5 rounded-full text-xs text-zinc-400 border border-white/10 bg-zinc-900/40 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors"
            >
              &quot;{chip}&quot;
            </button>
          ))}
        </div>
      )}

      {/* Category Filters (multi-select) */}
      <div className="mt-8 flex flex-wrap gap-2 justify-center max-w-4xl z-10">
        {CATEGORIES.map((cat) => {
          const active = cat === "All" ? selectedCategories.length === 0 : selectedCategories.includes(cat);
          return (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              aria-pressed={active}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-bold transition-all border uppercase tracking-wider backdrop-blur-md",
                active
                  ? "bg-emerald-500 text-black border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                  : "bg-zinc-900/50 text-zinc-500 border-zinc-800 hover:text-white hover:border-zinc-600"
              )}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Pricing Filter */}
      <div className="mt-3 flex flex-wrap gap-2 justify-center max-w-4xl z-10">
        {PRICING_FILTERS.map((p) => (
          <button
            key={p}
            onClick={() => setSelectedPricing(p)}
            aria-pressed={selectedPricing === p}
            className={cn(
              "px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border uppercase tracking-wider",
              selectedPricing === p
                ? "bg-cyan-500 text-black border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                : "bg-zinc-900/30 text-zinc-600 border-zinc-800 hover:text-white hover:border-zinc-600"
            )}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="mt-16 w-full max-w-7xl z-10">
        {/* Sort Controls */}
        <div className="flex justify-end gap-2 mb-6">
          {SORT_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setSortBy(value)}
              aria-pressed={sortBy === value}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border",
                sortBy === value
                  ? "bg-white text-black border-white"
                  : "bg-zinc-900/50 text-zinc-500 border-zinc-800 hover:text-white hover:border-zinc-600"
              )}
            >
              <Icon className="h-3 w-3" /> {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {isHunting && (
                <>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </>
            )}

            {sortedTools.length > 0 ? (
                sortedTools.map((tool, index) => (
                    <ToolCard
                        key={tool.id}
                        tool={tool}
                        handleVote={handleVote}
                        hasVoted={votedTools.includes(tool.id)}
                        className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
                        style={{ animationDelay: `${Math.min(index, 12) * 40}ms`, animationDuration: "400ms" }}
                    />
                ))
            ) : !isHunting ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
                    <div className="relative mb-6 group cursor-pointer" onClick={handleDeepHunt}>
                        <div className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-xl group-hover:bg-emerald-500/40 transition-all duration-500"></div>
                        <div className="relative bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-2xl group-hover:scale-110 transition-transform duration-300">
                            <Sparkles className="h-12 w-12 text-emerald-500 animate-pulse" />
                        </div>
                    </div>
                    
                    <h2 className="text-3xl font-bold text-white mb-3">
                        No &quot;{searchQuery}&quot; tools in our vault.
                    </h2>
                    <p className="text-zinc-400 mb-8 max-w-md mx-auto text-lg">
                        But they exist on the web. Activate the AI Agent to hunt them down for you.
                    </p>
                    
                    <Button 
                        onClick={handleDeepHunt}
                        className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-10 py-7 text-xl rounded-2xl shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] transition-all hover:scale-105"
                    >
                        <Zap className="mr-2 h-6 w-6 fill-black" />
                        Launch Deep Search
                    </Button>
                </div>
            ) : null}
        </div>
      </div>
    </div>
  );
}
