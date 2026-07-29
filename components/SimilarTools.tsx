import { Sparkles } from "lucide-react";
import { ToolCard } from "@/components/ToolCard";
import type { Tool } from "@/lib/types";

export default function SimilarTools({ tools, title = "Similar Tools" }: { tools: Tool[]; title?: string }) {
  if (!tools || tools.length === 0) return null;

  return (
    <div className="mt-16">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="h-5 w-5 text-emerald-500" />
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
}
