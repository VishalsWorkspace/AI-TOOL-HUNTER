"use client";

import { useEffect, useState } from "react";
import { StarRating } from "@/components/StarRating";
import { useUser } from "@/lib/useUser";
import { createClient } from "@/lib/supabase";
import type { ToolReview } from "@/lib/types";

export function ReviewForm({
  toolId,
  onSubmitted,
}: {
  toolId: number;
  onSubmitted?: (review: ToolReview) => void;
}) {
  const { user, loading } = useUser();
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from("tool_reviews")
      .select("*")
      .eq("tool_id", toolId)
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setHasExisting(true);
          setRating(data.rating);
          setText(data.review || "");
        }
      });
  }, [user, toolId]);

  const handleSubmit = async () => {
    if (!user || rating === 0) return;
    setSubmitting(true);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("tool_reviews")
      .upsert(
        {
          tool_id: toolId,
          user_id: user.id,
          rating,
          review: text || null,
          user_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email,
          user_avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture,
        },
        { onConflict: "tool_id,user_id" }
      )
      .select()
      .single();

    setSubmitting(false);

    if (!error && data) {
      setHasExisting(true);
      onSubmitted?.(data as ToolReview);
    }
  };

  if (loading) return null;

  if (!user) {
    return (
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 text-center text-sm text-zinc-500">
        Login to leave a review.
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 space-y-4">
      <div>
        <p className="text-sm font-bold text-white mb-2">{hasExisting ? "Update your review" : "Leave a review"}</p>
        <StarRating rating={rating} size="lg" interactive onChange={setRating} />
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What do you think of this tool?"
        rows={3}
        className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 resize-none"
      />
      <button
        onClick={handleSubmit}
        disabled={rating === 0 || submitting}
        className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-sm px-5 py-2.5 rounded-lg transition-colors"
      >
        {submitting ? "Submitting..." : hasExisting ? "Update Review" : "Submit Review"}
      </button>
    </div>
  );
}
