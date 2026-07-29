"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useUser } from "@/lib/useUser";
import { slugify, randomSlugSuffix } from "@/lib/utils";
import type { Tool } from "@/lib/types";

export function CreateStackModal({ tools, onClose }: { tools: Tool[]; onClose: () => void }) {
  const { user } = useUser();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleTool = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleCreate = async () => {
    if (!user || !name.trim() || selectedIds.length === 0) return;
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const slug = `${slugify(name)}-${randomSlugSuffix()}`;

    const { data, error: insertError } = await supabase
      .from("user_stacks")
      .insert({
        user_id: user.id,
        name: name.trim(),
        description: description.trim() || null,
        tool_ids: selectedIds,
        is_public: isPublic,
        slug,
        user_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email,
        user_avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture,
      })
      .select()
      .single();

    setSubmitting(false);

    if (insertError || !data) {
      setError("Couldn't create stack. Try again.");
      return;
    }

    onClose();
    router.push(`/stack/${data.slug}`);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-zinc-950 border border-white/10 rounded-2xl p-6 max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">Create Stack</h3>
          <button onClick={onClose} aria-label="Close" className="text-zinc-500 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Design Workflow"
              className="w-full mt-1 bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full mt-1 bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">
              Pick tools ({selectedIds.length} selected)
            </label>
            <div className="max-h-48 overflow-y-auto space-y-1.5 border border-zinc-800 rounded-lg p-2">
              {tools.length === 0 ? (
                <p className="text-xs text-zinc-600 p-2">Save some tools first, then come back to build a stack.</p>
              ) : (
                tools.map((tool) => (
                  <label key={tool.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-zinc-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(tool.id)}
                      onChange={() => toggleTool(tool.id)}
                      className="accent-emerald-500"
                    />
                    <span className="text-sm text-zinc-300">{tool.title}</span>
                  </label>
                ))
              )}
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="accent-emerald-500" />
            <span className="text-sm text-zinc-400">Make this stack public (shareable link)</span>
          </label>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            onClick={handleCreate}
            disabled={!name.trim() || selectedIds.length === 0 || submitting}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-sm py-2.5 rounded-lg transition-colors"
          >
            {submitting ? "Creating..." : "Create Stack"}
          </button>
        </div>
      </div>
    </div>
  );
}
