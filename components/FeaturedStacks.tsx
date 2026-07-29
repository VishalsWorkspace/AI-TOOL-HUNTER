import Link from "next/link";
import { Layers } from "lucide-react";
import type { UserStack } from "@/lib/types";

export default function FeaturedStacks({ stacks }: { stacks: UserStack[] }) {
  if (!stacks || stacks.length === 0) return null;

  return (
    <div className="w-full max-w-7xl mt-4 mb-8">
      <div className="flex items-center gap-2 mb-4 px-1">
        <Layers className="h-5 w-5 text-cyan-400" />
        <h2 className="text-xl font-bold text-white">Featured Stacks</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stacks.map((stack) => (
          <Link
            key={stack.id}
            href={`/stack/${stack.slug}`}
            className="block bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 hover:border-cyan-500/50 transition-colors"
          >
            <h3 className="text-lg font-bold text-white mb-1">{stack.name}</h3>
            {stack.description && <p className="text-sm text-zinc-500 mb-3 line-clamp-2">{stack.description}</p>}
            <div className="flex items-center justify-between text-xs text-zinc-600">
              <span>by {stack.user_name || "Anonymous"}</span>
              <span className="font-mono">{stack.tool_ids.length} tools</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
