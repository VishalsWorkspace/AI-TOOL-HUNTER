"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, ExternalLink, Code, PenTool, Monitor, BookOpen, 
  Sparkles, Zap, Check, Terminal, Bot, Video, Briefcase, 
  FileText, Music, Flame 
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

// --- INTERFACES ---
interface Tool {
  id: number;
  title: string;
  description: string;
  tags: string[];
  utility_score: number;
  link: string;
  tutorial_link?: string;
  pricing?: string;
  pros?: string[];
  slug?: string;      // For SEO Pages
  image_url?: string; // For Banners
  votes?: number;     // For Social Proof
}

const CATEGORIES = ["All", "Coding", "Writing", "Design", "Video", "Business", "PDF", "Audio", "Research"];

// --- SUB-COMPONENTS ---

// 1. The "Billion Dollar" Card
const ToolCard = ({ tool, handleVote, hasVoted }: { tool: Tool, handleVote: any, hasVoted: boolean }) => (
  <div className="group relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)] flex flex-col h-full">
    
    {/* IMAGE BANNER */}
    <div className="h-36 w-full bg-zinc-900/50 relative overflow-hidden border-b border-white/5">
        {tool.image_url ? (
            <img 
              src={tool.image_url} 
              alt={tool.title} 
              className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" 
            />
        ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-900 to-black">
                {/* Fallback Icon based on category */}
                <div className="text-zinc-700 group-hover:text-emerald-500/50 transition-colors">
                   {tool.tags.some(t => t.includes("Video")) ? <Video className="h-12 w-12" /> : <Bot className="h-12 w-12" />}
                </div>
            </div>
        )}
        
        {/* Pricing Badge Overlay */}
        {tool.pricing && (
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-white border border-white/10 uppercase tracking-wider shadow-xl">
                {tool.pricing}
            </div>
        )}
    </div>

    {/* CONTENT */}
    <div className="p-6 flex flex-col flex-1">
        
        {/* Header Row */}
        <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-bold text-white leading-tight group-hover:text-emerald-400 transition-colors">
              {tool.slug ? (
                <Link href={`/tool/${tool.slug}`} className="hover:underline decoration-emerald-500 decoration-2 underline-offset-4">
                    {tool.title}
                </Link>
              ) : (
                <a href={tool.link} target="_blank" rel="noopener noreferrer">
                    {tool.title}
                </a>
              )}
            </h3>

            {/* Vote Button */}
            <button 
                onClick={(e) => handleVote(tool.id, e)}
                className={cn(
                    "flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-lg border transition-all ml-2",
                    hasVoted 
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
                        : "bg-zinc-800 text-zinc-500 border-zinc-700 hover:text-white hover:border-zinc-500"
                )}
            >
                <Flame className={cn("h-3 w-3", hasVoted && "fill-emerald-400")} />
                {tool.votes || 0}
            </button>
        </div>

        <p className="text-zinc-400 text-sm leading-relaxed mb-6 line-clamp-2">
            {tool.description}
        </p>

        {/* Pros / Features */}
        {tool.pros && tool.pros.length > 0 && (
            <div className="mb-6 space-y-2">
                {tool.pros.slice(0, 2).map((pro, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-zinc-300">
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate">{pro}</span>
                    </div>
                ))}
            </div>
        )}

        {/* Footer Actions */}
        <div className="mt-auto pt-4 border-t border-white/5 flex gap-3">
            <a 
                href={tool.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 bg-white text-black font-bold text-sm py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors shadow-[0_0_15px_-5px_rgba(255,255,255,0.3)]"
            >
                Visit <ExternalLink className="h-3 w-3" />
            </a>
            {tool.tutorial_link && (
                <a 
                    href={tool.tutorial_link}
                    target="_blank"
                    className="px-3 py-2.5 rounded-lg bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white hover:border-zinc-600 transition-all"
                    title="Read Guide"
                >
                    <BookOpen className="h-4 w-4" />
                </a>
            )}
        </div>
    </div>
  </div>
);

// 2. The "Thinking" Skeleton (Displayed while Hunting)
const SkeletonCard = () => (
  <div className="bg-zinc-900/20 border border-white/5 rounded-2xl h-[400px] flex flex-col animate-pulse overflow-hidden">
    <div className="h-36 bg-zinc-800/50 w-full"></div>
    <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between mb-4">
            <div className="h-8 w-1/2 bg-zinc-800 rounded-lg"></div>
            <div className="h-8 w-12 bg-zinc-800 rounded-lg"></div>
        </div>
        <div className="h-4 w-full bg-zinc-800/50 rounded mb-2"></div>
        <div className="h-4 w-2/3 bg-zinc-800/50 rounded mb-6"></div>
        <div className="mt-auto h-10 w-full bg-zinc-800 rounded-lg"></div>
    </div>
  </div>
);

// --- MAIN DASHBOARD ---

export default function ToolDashboard({ tools: initialTools }: { tools: Tool[] }) {
  const [allTools, setAllTools] = useState<Tool[]>(initialTools);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isHunting, setIsHunting] = useState(false);
  const [votedTools, setVotedTools] = useState<number[]>([]);

  // Filter Logic
  const filteredTools = allTools.filter((tool) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = tool.title.toLowerCase().includes(q) || tool.description.toLowerCase().includes(q) || (tool.tags && tool.tags.some(t => t.toLowerCase().includes(q)));
    const matchesCategory = selectedCategory === "All" || (tool.tags && tool.tags.some(tag => tag.includes(selectedCategory)));
    return matchesSearch && matchesCategory;
  });

  // Handle Deep Hunt
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
        // Add random ID to prevent key collision
        const newTools = data.tools.map((t: any) => ({ ...t, id: Math.floor(Math.random() * 1000000000) })); 
        setAllTools(prev => {
            const combined = [...newTools, ...prev];
            // Remove duplicates by title
            return combined.filter((tool, index, self) =>
                index === self.findIndex((t) => t.title === tool.title)
            );
        });
        setSelectedCategory("All");
      }
    } catch (e) { console.error(e); }
    setIsHunting(false);
  };

  // Handle Vote
  const handleVote = async (toolId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (votedTools.includes(toolId)) return;

    setAllTools(prev => prev.map(t => t.id === toolId ? { ...t, votes: (t.votes || 0) + 1 } : t));
    setVotedTools(prev => [...prev, toolId]);

    // Fire and forget to DB
    await supabase.rpc('increment_votes', { row_id: toolId });
  };

  return (
    <div className="w-full flex flex-col items-center pb-20 px-4">
      
      {/* 1. SEARCH INPUT (With Tilt Effect) */}
      <div className="mt-12 w-full max-w-xl relative group z-20">
         <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
         <div className="relative flex items-center bg-black rounded-xl border border-white/10">
           <Search className="ml-4 h-5 w-5 text-zinc-500" />
           <input 
             className="flex-1 bg-transparent border-none px-4 py-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-0 text-lg"
             placeholder="What do you want to build? (e.g. '3D Assets')..."
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

      {/* 2. FILTERS */}
      <div className="mt-8 flex flex-wrap gap-2 justify-center max-w-4xl z-10">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-bold transition-all border uppercase tracking-wider backdrop-blur-md",
              selectedCategory === cat
                ? "bg-emerald-500 text-black border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                : "bg-zinc-900/50 text-zinc-500 border-zinc-800 hover:text-white hover:border-zinc-600"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 3. GRID */}
      <div className="mt-16 w-full max-w-7xl z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Skeletons appear when hunting */}
            {isHunting && (
                <>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </>
            )}

            {/* Real Tools */}
            {filteredTools.length > 0 ? (
                filteredTools.map((tool) => (
                    <ToolCard 
                        key={tool.id} 
                        tool={tool} 
                        handleVote={handleVote}
                        hasVoted={votedTools.includes(tool.id)}
                    />
                ))
            ) : !isHunting && (
                // Empty State
                <div className="col-span-full text-center py-32 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-zinc-900 mb-6 border border-zinc-800 shadow-xl">
                        <Sparkles className="h-10 w-10 text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">No tools found yet.</h2>
                    <p className="text-zinc-500 mb-8 max-w-md mx-auto">
                        Our database is pristine. Hit "Deep Search" to unleash the AI Agent on the live web.
                    </p>
                    <Button 
                        onClick={handleDeepHunt}
                        className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 py-6 text-lg rounded-xl shadow-[0_0_30px_-5px_rgba(16,185,129,0.4)] transition-transform hover:scale-105"
                    >
                        Launch Deep Hunt
                    </Button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}