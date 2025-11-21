"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Bot, ExternalLink, Code, PenTool, Monitor, BookOpen, Sparkles, CheckCircle2, DollarSign, Video } from "lucide-react";
import { cn } from "@/lib/utils";

interface Tool {
  id: number;
  title: string;
  description: string;
  tags: string[];
  utility_score: number;
  link: string;
  tutorial_link?: string;
  pricing?: string; // New Field
  pros?: string[];  // New Field
}

const CATEGORIES = ["All", "Coding", "Writing", "Design", "Video", "Business", "PDF", "Audio", "Research"];

export default function ToolDashboard({ tools: initialTools }: { tools: Tool[] }) {
  const [allTools, setAllTools] = useState<Tool[]>(initialTools);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isHunting, setIsHunting] = useState(false);

  const filteredTools = allTools.filter((tool) => {
    const matchesSearch = 
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tool.tags && tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    
    const matchesCategory = 
      selectedCategory === "All" || 
      (tool.tags && tool.tags.some(tag => tag.includes(selectedCategory)));

    return matchesSearch && matchesCategory;
  });

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
        const newTools = data.tools.map((t: any) => ({ ...t, id: Math.floor(Math.random() * 1000000000) }));
        setAllTools(prev => {
            const combined = [...newTools, ...prev];
            return combined.filter((tool, index, self) =>
                index === self.findIndex((t) => t.title === tool.title)
            );
        });
      }
    } catch (e) { console.error(e); }
    setIsHunting(false);
  };

  return (
    <div className="w-full flex flex-col items-center min-h-screen aurora-bg pb-20">
      
      {/* 1. HERO SECTION */}
      <div className="text-center mt-20 px-4 animate-in fade-in slide-in-from-top-8 duration-700">
         <Badge variant="outline" className="mb-6 border-emerald-400/50 text-emerald-300 bg-emerald-950/30 backdrop-blur-md px-4 py-1">
            <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></div>
            Live Intelligence Engine
         </Badge>
         <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-2xl">
            Find the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Top 1%</span> of AI.
         </h1>
         <p className="mt-6 text-zinc-300 text-lg max-w-xl mx-auto leading-relaxed">
            Don't just search. <strong>Hunt.</strong> Our AI Agent scans thousands of tools daily to find the ones that actually work.
         </p>
      </div>

      {/* 2. SEARCH BAR (Glass Effect) */}
      <div className="mt-12 w-full max-w-xl px-4 relative group">
         <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
         <div className="relative flex items-center bg-zinc-900/90 backdrop-blur-xl rounded-lg border border-zinc-700/50 shadow-2xl">
           <Search className="ml-4 h-5 w-5 text-zinc-400" />
           <input 
             className="flex-1 bg-transparent border-none px-4 py-4 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-0 text-lg"
             placeholder="What do you want to build? (e.g. '3D Assets')..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)} 
             onKeyDown={(e) => e.key === 'Enter' && filteredTools.length === 0 && handleDeepHunt()}
           />
           <Button 
             onClick={handleDeepHunt} 
             disabled={isHunting}
             className="mr-2 bg-white text-black hover:bg-zinc-200 font-bold rounded-md px-6"
           >
             {isHunting ? "Hunting..." : "Search"}
           </Button>
         </div>
      </div>

      {/* 3. CATEGORIES */}
      <div className="mt-8 flex flex-wrap gap-2 justify-center max-w-4xl px-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-5 py-2 rounded-full text-sm font-medium transition-all border backdrop-blur-sm",
              selectedCategory === cat
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-lg shadow-emerald-900/20"
                : "bg-zinc-900/40 text-zinc-400 border-zinc-800/50 hover:bg-zinc-800/60 hover:text-white hover:border-zinc-600"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 4. TOOL GRID (Glass Cards) */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-7xl px-6">
        {filteredTools.length > 0 ? (
          filteredTools.map((tool) => (
            <div key={tool.id} className="glass-card p-6 rounded-2xl hover:scale-[1.02] transition-all duration-300 group flex flex-col justify-between relative overflow-hidden">
              
              {/* Hover Glow Effect */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full -mr-16 -mt-16 pointer-events-none"></div>

              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3 items-center">
                    <div className="p-2.5 bg-zinc-800/80 rounded-xl text-emerald-400 border border-zinc-700/50">
                      {/* Icon Logic */}
                      {tool.tags.some(t => t.includes("Coding")) ? <Code className="h-6 w-6" /> : 
                       tool.tags.some(t => t.includes("Design")) ? <Monitor className="h-6 w-6" /> :
                       tool.tags.some(t => t.includes("Video")) ? <Video className="h-6 w-6" /> :
                       <Bot className="h-6 w-6" />}
                    </div>
                    {/* PRICING BADGE */}
                    {tool.pricing && (
                        <span className="text-xs font-mono text-zinc-400 bg-zinc-900/50 px-2 py-1 rounded border border-zinc-800 flex items-center gap-1">
                            <DollarSign className="h-3 w-3" /> {tool.pricing}
                        </span>
                    )}
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 backdrop-blur-sm">
                    {tool.utility_score}/10
                  </Badge>
                </div>
                
                <h3 className="text-xl font-bold text-white leading-tight tracking-tight">
                  {tool.title}
                </h3>
                
                <p className="mt-3 text-zinc-400 text-sm leading-relaxed line-clamp-2">
                  {tool.description}
                </p>

                {/* PROS SECTION (The Detail Upgrade) */}
                {tool.pros && tool.pros.length > 0 && (
                    <div className="mt-4 space-y-1">
                        {tool.pros.slice(0, 2).map((pro, k) => (
                            <div key={k} className="flex items-start gap-2 text-xs text-zinc-300">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                                <span>{pro}</span>
                            </div>
                        ))}
                    </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800/50">
                <div className="flex flex-wrap gap-2 mb-4">
                  {tool.tags && tool.tags.map((tag, j) => (
                    <span key={j} className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 bg-zinc-900/50 px-2 py-1 rounded border border-zinc-800/50">
                        {tag}
                    </span>
                  ))}
                </div>

                <div className="flex gap-3">
                    {tool.link && !tool.link.includes("google.com") ? (
                        <a 
                            href={tool.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-1 bg-white/90 hover:bg-white text-black text-center py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg shadow-white/10 flex items-center justify-center gap-2"
                        >
                            Visit Tool <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                    ) : (
                        <button disabled className="flex-1 bg-zinc-800/50 text-zinc-600 cursor-not-allowed text-center py-2.5 rounded-lg text-sm font-medium border border-zinc-800">
                            Searching...
                        </button>
                    )}
                    
                    {tool.tutorial_link && (
                        <a 
                            href={tool.tutorial_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-1 bg-zinc-800/50 text-zinc-300 text-center py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-700/50 transition-all border border-zinc-700/50 flex items-center justify-center gap-2"
                        >
                            Guide <BookOpen className="h-3.5 w-3.5" />
                        </a>
                    )}
                </div>
              </div>
            </div>
          ))
        ) : (
          // EMPTY STATE (Aurora Style)
          <div className="col-span-full py-24 flex flex-col items-center justify-center text-center glass-card rounded-3xl border-dashed border-zinc-700/50">
             <div className="relative">
                <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 rounded-full"></div>
                <Sparkles className="relative h-16 w-16 text-emerald-400 mb-6 animate-bounce" />
             </div>
             <h3 className="text-3xl font-bold text-white mb-3">
               No tools found for "{searchQuery}"
             </h3>
             <p className="text-zinc-400 mb-8 max-w-md text-lg">
               Our database is fresh. Activate the AI Hunter to find the absolute best tools for this right now.
             </p>
             
             <Button 
                onClick={handleDeepHunt}
                disabled={isHunting}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-8 px-10 text-xl rounded-2xl shadow-2xl shadow-emerald-900/40 transition-all hover:scale-105"
             >
                {isHunting ? (
                  <>
                    <span className="animate-spin mr-4">⏳</span> Scouring the Web...
                  </>
                ) : (
                  <>
                    🚀 Launch Deep Search
                  </>
                )}
             </Button>
          </div>
        )}
      </div>
    </div>
  );
}