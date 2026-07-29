"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Check, Star, Trash2 } from "lucide-react";
import { useCompare } from "@/components/CompareProvider";
import { supabase } from "@/lib/supabaseClient";
import { getPrimaryCategory } from "@/lib/constants";
import type { Tool } from "@/lib/types";

const ROWS: { label: string; render: (t: Tool) => React.ReactNode }[] = [
  { label: "Category", render: (t) => getPrimaryCategory(t.tags) || "—" },
  { label: "Pricing", render: (t) => t.pricing || "—" },
  {
    label: "Utility Score",
    render: (t) => (
      <span className="flex items-center gap-1 text-white font-bold">
        <Star className="h-3.5 w-3.5 fill-emerald-500 text-emerald-500" /> {t.utility_score}/100
      </span>
    ),
  },
  {
    label: "Pros",
    render: (t) =>
      t.pros && t.pros.length > 0 ? (
        <ul className="space-y-1.5">
          {t.pros.map((pro, i) => (
            <li key={i} className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> {pro}
            </li>
          ))}
        </ul>
      ) : (
        "—"
      ),
  },
  {
    label: "Tags",
    render: (t) => (
      <div className="flex flex-wrap gap-1.5">
        {t.tags?.map((tag) => (
          <span key={tag} className="px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-500 uppercase font-bold">
            {tag}
          </span>
        ))}
      </div>
    ),
  },
];

export default function ComparePage() {
  const { compareIds, clearCompare } = useCompare();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (compareIds.length === 0) {
        if (!cancelled) {
          setTools([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      const { data } = await supabase.from("tools").select("*").in("id", compareIds);
      if (cancelled) return;
      const ordered = compareIds
        .map((id) => (data ?? []).find((t) => t.id === id))
        .filter((t): t is Tool => Boolean(t));
      setTools(ordered);
      setLoading(false);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [compareIds]);

  return (
    <main className="min-h-screen bg-black text-white px-4 pb-24">
      <div className="max-w-6xl mx-auto pt-12">
        <Link href="/" className="inline-flex items-center text-zinc-500 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Hunter
        </Link>

        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-bold">Compare Tools</h1>
          {tools.length > 0 && (
            <button
              onClick={clearCompare}
              className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-red-400 transition-colors"
            >
              <Trash2 className="h-4 w-4" /> Clear comparison
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-24 text-zinc-500">Loading comparison...</div>
        ) : tools.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-xl text-zinc-400 mb-2">Nothing to compare yet.</p>
            <p className="text-zinc-600 mb-6">Hover a tool card and check &quot;Compare&quot; on at least two tools.</p>
            <Link href="/" className="text-emerald-400 hover:underline">
              Go find some tools →
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop: side-by-side table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="w-40" />
                    {tools.map((tool) => (
                      <th key={tool.id} className="text-left align-top p-4 bg-zinc-900/40 border border-zinc-800 min-w-[220px]">
                        <div className="flex flex-col gap-3">
                          <h3 className="text-lg font-bold text-white">{tool.title}</h3>
                          <p className="text-xs text-zinc-500 line-clamp-2">{tool.description}</p>
                          <a
                            href={tool.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 bg-white text-black font-bold text-xs py-2 rounded-lg hover:bg-zinc-200 transition-colors"
                          >
                            Visit <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((row) => (
                    <tr key={row.label}>
                      <td className="p-4 border border-zinc-800 bg-zinc-950 text-xs font-bold text-zinc-500 uppercase tracking-wider align-top">
                        {row.label}
                      </td>
                      {tools.map((tool) => (
                        <td key={tool.id} className="p-4 border border-zinc-800 text-sm text-zinc-300 align-top">
                          {row.render(tool)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: stacked cards */}
            <div className="md:hidden space-y-8">
              {tools.map((tool) => (
                <div key={tool.id} className="border border-zinc-800 rounded-2xl overflow-hidden">
                  <div className="p-4 bg-zinc-900/40 space-y-3">
                    <h3 className="text-lg font-bold text-white">{tool.title}</h3>
                    <p className="text-xs text-zinc-500">{tool.description}</p>
                    <a
                      href={tool.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 bg-white text-black font-bold text-xs py-2 px-4 rounded-lg hover:bg-zinc-200 transition-colors"
                    >
                      Visit <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="divide-y divide-zinc-900">
                    {ROWS.map((row) => (
                      <div key={row.label} className="p-4">
                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">{row.label}</div>
                        <div className="text-sm text-zinc-300">{row.render(tool)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
