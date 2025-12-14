import { supabase } from '@/lib/supabaseClient';
import ToolDashboard from "@/components/ToolDashboard"; 
import { Badge } from "@/components/ui/badge";
import { Sparkles, Terminal } from "lucide-react";

// Revalidate data every 60 seconds (keeps it fresh)
export const revalidate = 60;

export default async function Home() {
  // Fetch tools from DB
  const { data: tools } = await supabase
    .from('tools')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-black selection:bg-emerald-500/30 text-white overflow-x-hidden relative">
      
      {/* 1. BACKGROUND EFFECTS (The "Crazy" Look) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      {/* 2. "BUILT BY VISHAL" BADGE (Fixed Corner) */}
      <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-1000">
        <Badge variant="outline" className="py-2 px-4 bg-black/50 backdrop-blur-md border-white/10 text-zinc-400 font-mono text-xs hover:text-white hover:border-emerald-500 transition-colors cursor-default">
            <Terminal className="w-3 h-3 mr-2 inline-block text-emerald-500" />
            Engineered by VISHAL
        </Badge>
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
                  Don't just search. <span className="text-white font-bold">Hunt.</span> <br className="hidden md:block"/>
                  Our AI Agent scans the live internet daily to find the Top 1% of tools that actually work.
              </p>
          </div>

          {/* 4. THE DASHBOARD (Your existing search/grid) */}
          <ToolDashboard tools={tools || []} />
          
      </div>
    </main>
  );
}