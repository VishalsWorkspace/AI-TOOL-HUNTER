"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSavedTools } from "@/components/SavedToolsProvider";

export function BookmarkButton({
  toolId,
  className,
  size = "md",
}: {
  toolId: number;
  className?: string;
  size?: "sm" | "md";
}) {
  const { isSaved, toggleSave } = useSavedTools();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const saved = isSaved(toolId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await toggleSave(toolId);
    if (result.requiresLogin) {
      setShowLoginPrompt(true);
      setTimeout(() => setShowLoginPrompt(false), 2500);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleClick}
        aria-pressed={saved}
        aria-label={saved ? "Remove from saved tools" : "Save tool"}
        className={cn(
          "flex items-center justify-center rounded-full backdrop-blur-md border transition-all shrink-0",
          size === "sm" ? "h-7 w-7" : "h-9 w-9",
          saved
            ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
            : "bg-black/60 border-white/10 text-zinc-400 hover:text-white hover:border-white/30",
          className
        )}
      >
        <Bookmark className={cn(size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4", saved && "fill-emerald-400")} />
      </button>

      {showLoginPrompt && (
        <div className="absolute top-full right-0 mt-2 whitespace-nowrap bg-zinc-950 border border-white/10 text-xs text-white px-3 py-1.5 rounded-lg shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          Login to save tools
        </div>
      )}
    </div>
  );
}
