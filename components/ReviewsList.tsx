import { StarRating } from "@/components/StarRating";
import { formatRelativeDate } from "@/lib/utils";
import type { ToolReview } from "@/lib/types";

export function ReviewsList({ reviews }: { reviews: ToolReview[] }) {
  if (reviews.length === 0) {
    return <p className="text-sm text-zinc-600">No reviews yet — be the first.</p>;
  }

  return (
    <div className="space-y-6">
      {reviews.map((r) => (
        <div key={r.id} className="flex gap-3 pb-6 border-b border-zinc-900 last:border-0 last:pb-0">
          {r.user_avatar ? (
            <img
              src={r.user_avatar}
              alt={r.user_name || "User"}
              referrerPolicy="no-referrer"
              className="h-9 w-9 rounded-full shrink-0"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-emerald-500 text-black flex items-center justify-center text-xs font-bold shrink-0">
              {(r.user_name || "?")[0]?.toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-sm font-bold text-white truncate">{r.user_name || "Anonymous"}</span>
              <span className="text-xs text-zinc-600 shrink-0">{formatRelativeDate(r.created_at)}</span>
            </div>
            <StarRating rating={r.rating} size="sm" />
            {r.review && <p className="text-sm text-zinc-400 mt-2 leading-relaxed">{r.review}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
