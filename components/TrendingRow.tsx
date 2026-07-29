import { TrendingUp } from "lucide-react";
import { ToolCard } from "@/components/ToolCard";
import type { ReviewStats, Tool } from "@/lib/types";

export default function TrendingRow({
  tools,
  reviewStats = {},
}: {
  tools: Tool[];
  reviewStats?: Record<number, ReviewStats>;
}) {
  if (!tools || tools.length === 0) return null;

  return (
    <div className="w-full max-w-7xl mt-4 mb-8">
      <div className="flex items-center gap-2 mb-4 px-1">
        <TrendingUp className="h-5 w-5 text-emerald-500" />
        <h2 className="text-xl font-bold text-white">Trending This Week</h2>
      </div>
      <div
        className={
          "flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory " +
          "[&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:bg-zinc-800 " +
          "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
        }
      >
        {tools.map((tool) => (
          <div key={tool.id} className="w-[300px] shrink-0 snap-start">
            <ToolCard tool={tool} reviewStats={reviewStats[tool.id]} />
          </div>
        ))}
      </div>
    </div>
  );
}
