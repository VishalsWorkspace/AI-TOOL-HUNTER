"use client";

import { useState } from "react";
import { Download, Check } from "lucide-react";
import { useUser } from "@/lib/useUser";
import { useSavedTools } from "@/components/SavedToolsProvider";

export function SaveAllToolsButton({ toolIds }: { toolIds: number[] }) {
  const { user } = useUser();
  const { saveMany } = useSavedTools();
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const handleSaveAll = async () => {
    if (!user || toolIds.length === 0) return;
    setSaving(true);
    await saveMany(toolIds);
    setSaving(false);
    setDone(true);
  };

  if (!user) {
    return <div className="text-sm text-zinc-600 shrink-0">Login to save all tools from this stack.</div>;
  }

  return (
    <button
      onClick={handleSaveAll}
      disabled={saving || done}
      className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-70 text-black font-bold text-sm px-5 py-2.5 rounded-lg transition-colors shrink-0"
    >
      {done ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
      {done ? "Saved!" : saving ? "Saving..." : "Save all tools"}
    </button>
  );
}
