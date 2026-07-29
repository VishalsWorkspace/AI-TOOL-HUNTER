"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useUser } from "@/lib/useUser";
import { CATEGORIES, PRICING_FILTERS } from "@/lib/constants";

export function SubmitToolModal({ onClose }: { onClose: () => void }) {
  const { user } = useUser();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[1]);
  const [pricing, setPricing] = useState<string>(PRICING_FILTERS[1]);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!user || !title.trim() || !url.trim()) return;
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error: insertError } = await supabase.from("tool_submissions").insert({
      submitter_user_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      url: url.trim(),
      category,
      pricing,
    });

    setSubmitting(false);

    if (insertError) {
      setError("Couldn't submit. Try again.");
      return;
    }

    setSubmitted(true);
    setTimeout(onClose, 2000);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-zinc-950 border border-white/10 rounded-2xl p-6 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">Submit a Tool</h3>
          <button onClick={onClose} aria-label="Close" className="text-zinc-500 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-8">
            <p className="text-lg font-bold text-emerald-400 mb-1">Thank you!</p>
            <p className="text-sm text-zinc-500">We&apos;ll review your submission.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Tool Name</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Notion AI"
                className="w-full mt-1 bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">URL</label>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full mt-1 bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full mt-1 bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                >
                  {CATEGORIES.filter((c) => c !== "All").map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Pricing</label>
                <select
                  value={pricing}
                  onChange={(e) => setPricing(e.target.value)}
                  className="w-full mt-1 bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                >
                  {PRICING_FILTERS.filter((p) => p !== "ALL").map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Short Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full mt-1 bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 resize-none"
              />
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={!title.trim() || !url.trim() || submitting}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-sm py-2.5 rounded-lg transition-colors"
            >
              {submitting ? "Submitting..." : "Submit Tool"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
