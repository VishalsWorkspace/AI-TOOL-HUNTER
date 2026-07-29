"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Share2, Layers, Check, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { BookmarkButton } from "@/components/BookmarkButton";
import { useCompare } from "@/components/CompareProvider";
import type { Tool } from "@/lib/types";

export function ToolDetailActions({ tool }: { tool: Tool }) {
  const { isComparing, toggleCompare, maxReached } = useCompare();
  const comparing = isComparing(tool.id);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/tool/${tool.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard permission denied — nothing actionable, fail silently.
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full md:w-64 shrink-0">
      <div className="flex gap-2">
        <a
          href={tool.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-white text-black font-bold py-3 px-6 rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
        >
          Visit <ExternalLink className="h-4 w-4" />
        </a>
        <BookmarkButton toolId={tool.id} className="h-[46px] w-[46px]" />
      </div>

      <div className="flex gap-2">
        <Link
          href="/my-tools#stacks"
          className="flex-1 flex items-center justify-center gap-1.5 bg-zinc-900 text-zinc-300 border border-zinc-800 font-bold py-2.5 rounded-xl hover:text-white hover:border-zinc-600 transition-all text-sm"
        >
          <Layers className="h-4 w-4" /> Add to Stack
        </Link>
        <button
          onClick={() => toggleCompare(tool.id)}
          disabled={!comparing && maxReached}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 font-bold py-2.5 rounded-xl transition-all text-sm border disabled:opacity-40 disabled:cursor-not-allowed",
            comparing
              ? "bg-emerald-500 text-black border-emerald-500"
              : "bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-white hover:border-zinc-600"
          )}
        >
          {comparing ? <Check className="h-4 w-4" /> : <Scale className="h-4 w-4" />}
          {comparing ? "Added" : "Compare"}
        </button>
      </div>

      <button
        onClick={handleShare}
        className="w-full flex items-center justify-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors py-2"
      >
        <Share2 className="h-3.5 w-3.5" /> {copied ? "Link copied!" : "Share this tool"}
      </button>
    </div>
  );
}
