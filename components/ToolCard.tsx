"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, BookOpen, Check, Bot, Video, Eye, Star } from "lucide-react";
import { cn, isNewThisWeek } from "@/lib/utils";

// Tiny neutral-gray shimmer, shared across all cards as the blur placeholder
// while the real (arbitrary, external-domain) image loads.
const SHIMMER_BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
import type { ReviewStats, Tool } from "@/lib/types";
import { getPrimaryCategory } from "@/lib/constants";
import { BookmarkButton } from "@/components/BookmarkButton";
import { QuickViewModal } from "@/components/QuickViewModal";
import { useCompare } from "@/components/CompareProvider";

// --- STAGE 1: Resolve + proxy the stored OG image through wsrv.nl (bypasses CORS/hotlinking) ---
const formatImageUrl = (imgUrl: string | undefined, toolLink: string): string => {
  if (!imgUrl) return "";
  let absoluteUrl: string;
  if (!imgUrl.startsWith("http://") && !imgUrl.startsWith("https://")) {
    try {
      const origin = new URL(toolLink).origin;
      absoluteUrl = `${origin}${imgUrl.startsWith("/") ? imgUrl : `/${imgUrl}`}`;
    } catch { return ""; }
  } else {
    absoluteUrl = imgUrl.replace(/^http:\/\//i, "https://");
  }
  return `https://wsrv.nl/?url=${encodeURIComponent(absoluteUrl)}&w=600&h=300&fit=cover&output=webp`;
};

// --- STAGE 2: Clearbit Logo API — works for any domain, even when image_url is NULL ---
const getClearbitLogo = (toolLink: string): string => {
  try {
    const domain = new URL(toolLink).hostname.replace(/^www\./, "");
    return `https://logo.clearbit.com/${domain}`;
  } catch { return ""; }
};

export const ToolCard = ({
  tool,
  reviewStats,
  className,
  style,
}: {
  tool: Tool;
  reviewStats?: ReviewStats;
  className?: string;
  style?: React.CSSProperties;
}) => {
  // 3-stage image fallback:
  // Stage 1 → stored OG image via wsrv.nl proxy (handles CORS/hotlinking)
  // Stage 2 → Clearbit logo (works even when image_url is NULL — just needs the domain)
  // Stage 3 → bot/video icon (last resort)
  const [imgStage, setImgStage] = useState<1 | 2 | 3>(1);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const { isComparing, toggleCompare, maxReached } = useCompare();
  const comparing = isComparing(tool.id);

  const stage1Src = useMemo(() => formatImageUrl(tool.image_url, tool.link), [tool.image_url, tool.link]);
  const stage2Src = useMemo(() => getClearbitLogo(tool.link), [tool.link]);

  // Pick the right src based on current stage
  const activeSrc = imgStage === 1 ? stage1Src : imgStage === 2 ? stage2Src : "";

  const handleImgError = () => {
    if (imgStage === 1 && stage2Src) {
      setImgStage(2); // OG image failed → try Clearbit logo
    } else {
      setImgStage(3); // Clearbit also failed → show icon
    }
  };

  // If stage 1 has no URL (image_url was NULL), skip straight to stage 2
  const displaySrc = (imgStage === 1 && !stage1Src) ? stage2Src : activeSrc;
  const isClearbitLogo = (imgStage === 2) || (imgStage === 1 && !stage1Src);
  const category = getPrimaryCategory(tool.tags);
  const isNew = isNewThisWeek(tool.created_at);

  return (
    <div
      style={style}
      className={cn(
        "group relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/50 hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)] flex flex-col h-full",
        className
      )}
    >

      {/* IMAGE BANNER */}
      <div className="h-36 w-full bg-zinc-900/50 relative overflow-hidden border-b border-white/5">
          {displaySrc && imgStage !== 3 ? (
              <Image
                src={displaySrc}
                alt={tool.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                placeholder="blur"
                blurDataURL={SHIMMER_BLUR_DATA_URL}
                className={cn(
                  "transition-all duration-500",
                  isClearbitLogo
                    ? "object-contain p-6 opacity-70 group-hover:opacity-100 group-hover:scale-105"
                    : "object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105"
                )}
                onError={handleImgError}
              />
          ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-900 to-black">
                  <div className="text-zinc-700 group-hover:text-emerald-500/50 transition-colors">
                     {tool.tags?.some(t => t.includes("Video")) ? <Video className="h-12 w-12" /> : <Bot className="h-12 w-12" />}
                  </div>
              </div>
          )}

          <div className="absolute top-3 left-3 flex flex-col items-start gap-2">
              {category && (
                  <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-emerald-400 border border-emerald-500/30 uppercase tracking-wider shadow-xl">
                      {category}
                  </div>
              )}
              {isNew && (
                  <div className="bg-purple-500/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-white uppercase tracking-wider shadow-xl">
                      New
                  </div>
              )}
          </div>

          <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
              <BookmarkButton toolId={tool.id} size="sm" />
              {tool.pricing && (
                  <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-white border border-white/10 uppercase tracking-wider shadow-xl">
                      {tool.pricing}
                  </div>
              )}
          </div>

          <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickViewOpen(true); }}
              className="absolute inset-0 m-auto h-9 w-32 flex items-center justify-center gap-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/20 text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/90"
          >
              <Eye className="h-3.5 w-3.5" /> Quick View
          </button>

          <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleCompare(tool.id); }}
              disabled={!comparing && maxReached}
              className={cn(
                  "absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-0 group-hover:disabled:opacity-40",
                  comparing
                      ? "bg-emerald-500 text-black border-emerald-500 opacity-100"
                      : "bg-black/60 text-zinc-300 border-white/20 hover:border-white/40"
              )}
          >
              <span className={cn("h-3 w-3 rounded-sm border flex items-center justify-center shrink-0", comparing ? "border-black" : "border-zinc-400")}>
                  {comparing && <Check className="h-2.5 w-2.5" />}
              </span>
              Compare
          </button>
      </div>

      {quickViewOpen && (
          <QuickViewModal tool={tool} onClose={() => setQuickViewOpen(false)} />
      )}

      {/* CONTENT */}
      <div className="p-6 flex flex-col flex-1">
          <div className="flex justify-between items-start mb-3 gap-2">
              <h3 className="text-xl font-bold text-white leading-tight group-hover:text-emerald-400 transition-colors">
                <Link href={`/tool/${tool.slug}`} className="hover:underline decoration-emerald-500 decoration-2 underline-offset-4">
                    {tool.title}
                </Link>
              </h3>

              {reviewStats && reviewStats.review_count > 0 && (
                  <div className="flex items-center gap-1 text-xs font-bold text-zinc-300 shrink-0 mt-1">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      {reviewStats.avg_rating.toFixed(1)}
                      <span className="text-zinc-600 font-normal">({reviewStats.review_count})</span>
                  </div>
              )}
          </div>

          <p className="text-zinc-400 text-sm leading-relaxed mb-6 line-clamp-2">
              {tool.description}
          </p>

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
                      rel="noopener noreferrer"
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
};

export const SkeletonCard = () => (
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
