import { Sparkles } from "lucide-react";
import { ToolCard } from "@/components/ToolCard";
import type { ReviewStats, Tool } from "@/lib/types";

export default function RecommendedRow({
  tools,
  reviewStats = {},
}: {
  tools: Tool[];
  reviewStats?: Record<number, ReviewStats>;
}) {
  if (!tools || tools.length === 0) return null;

  return (
    <div className="w-full max-w-7xl mt-4 mb-8">
      <div className="flex items-center gap-2 mb-1 px-1">
        <Sparkles className="h-5 w-5 text-purple-400" />
        <h2 className="text-xl font-bold text-white">Recommended For You</h2>
      </div>
      <p className="text-xs text-zinc-500 px-1 mb-4">Based on your saved tools</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} reviewStats={reviewStats[tool.id]} />
        ))}
      </div>
    </div>
  );
}
