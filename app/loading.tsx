import { SkeletonCard } from "@/components/ToolCard";

export default function Loading() {
  return (
    <div className="min-h-screen bg-black px-4 pb-20 pt-32">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
