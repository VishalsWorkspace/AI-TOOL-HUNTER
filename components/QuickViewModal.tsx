"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { X, ExternalLink, Check } from "lucide-react";
import type { Tool } from "@/lib/types";
import { getPrimaryCategory } from "@/lib/constants";

export function QuickViewModal({ tool, onClose }: { tool: Tool; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  const category = getPrimaryCategory(tool.tags);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-zinc-950 border border-white/10 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          {category && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md">
              {category}
            </span>
          )}
          {tool.pricing && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-zinc-800 border border-white/10 px-2 py-0.5 rounded-md">
              {tool.pricing}
            </span>
          )}
        </div>

        <h3 className="text-2xl font-bold text-white mb-3 pr-8">{tool.title}</h3>
        <p className="text-zinc-400 leading-relaxed mb-5">{tool.description}</p>

        {tool.pros && tool.pros.length > 0 && (
          <div className="space-y-2 mb-6">
            {tool.pros.map((pro, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" /> {pro}
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <a
            href={tool.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-white text-black font-bold text-sm py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors"
          >
            Visit <ExternalLink className="h-3.5 w-3.5" />
          </a>
          {tool.slug && (
            <Link
              href={`/tool/${tool.slug}`}
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg bg-zinc-900 text-zinc-300 border border-zinc-800 hover:text-white hover:border-zinc-600 transition-all text-sm font-bold"
            >
              Full Details
            </Link>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
