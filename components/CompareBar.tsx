"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, ArrowRight } from "lucide-react";
import { useCompare } from "@/components/CompareProvider";
import { supabase } from "@/lib/supabaseClient";

export default function CompareBar() {
  const { compareIds, toggleCompare, clearCompare } = useCompare();
  const [titles, setTitles] = useState<Record<number, string>>({});

  useEffect(() => {
    if (compareIds.length === 0) return;
    let cancelled = false;

    supabase
      .from("tools")
      .select("id, title")
      .in("id", compareIds)
      .then(({ data }) => {
        if (cancelled) return;
        const map: Record<number, string> = {};
        for (const t of data ?? []) map[t.id] = t.title;
        setTitles(map);
      });

    return () => {
      cancelled = true;
    };
  }, [compareIds]);

  if (compareIds.length < 2) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-emerald-500/30 bg-zinc-950/95 backdrop-blur-xl animate-in slide-in-from-bottom-4 duration-300">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3 justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider mr-1 hidden sm:inline">
            Comparing:
          </span>
          {compareIds.map((id) => (
            <span
              key={id}
              className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-full pl-3 pr-2 py-1 text-xs text-white max-w-[160px]"
            >
              <span className="truncate">{titles[id] || "..."}</span>
              <button onClick={() => toggleCompare(id)} aria-label="Remove from comparison" className="text-zinc-500 hover:text-white shrink-0">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button onClick={clearCompare} className="text-xs text-zinc-500 hover:text-white transition-colors">
            Clear
          </button>
          <Link
            href="/compare"
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            Compare Now <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
