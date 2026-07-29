"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  rating,
  size = "sm",
  interactive = false,
  onChange,
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (value: number) => void;
}) {
  const sizeClass = size === "lg" ? "h-6 w-6" : size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          className={cn(
            !interactive && "cursor-default",
            interactive && "cursor-pointer hover:scale-110 transition-transform"
          )}
        >
          <Star
            className={cn(
              sizeClass,
              star <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-zinc-700"
            )}
          />
        </button>
      ))}
    </div>
  );
}
