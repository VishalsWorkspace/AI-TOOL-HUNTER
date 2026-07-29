"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase";
import { useUser } from "@/lib/useUser";

interface ToggleResult {
  ok: boolean;
  requiresLogin: boolean;
}

interface SavedToolsContextValue {
  isSaved: (toolId: number) => boolean;
  toggleSave: (toolId: number) => Promise<ToggleResult>;
  saveMany: (toolIds: number[]) => Promise<ToggleResult>;
  savedIds: Set<number>;
  loading: boolean;
}

const SavedToolsContext = createContext<SavedToolsContextValue | null>(null);

export function SavedToolsProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!user) {
        if (!cancelled) {
          setSavedIds(new Set());
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase.from("saved_tools").select("tool_id").eq("user_id", user.id);
      if (cancelled) return;
      setSavedIds(new Set((data ?? []).map((row) => row.tool_id as number)));
      setLoading(false);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const toggleSave = useCallback(
    async (toolId: number): Promise<ToggleResult> => {
      if (!user) return { ok: false, requiresLogin: true };

      const wasSaved = savedIds.has(toolId);
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (wasSaved) next.delete(toolId);
        else next.add(toolId);
        return next;
      });

      const supabase = createClient();
      const { error } = wasSaved
        ? await supabase.from("saved_tools").delete().eq("user_id", user.id).eq("tool_id", toolId)
        : await supabase.from("saved_tools").insert({ user_id: user.id, tool_id: toolId });

      if (error) {
        setSavedIds((prev) => {
          const next = new Set(prev);
          if (wasSaved) next.add(toolId);
          else next.delete(toolId);
          return next;
        });
        return { ok: false, requiresLogin: false };
      }

      return { ok: true, requiresLogin: false };
    },
    [user, savedIds]
  );

  const saveMany = useCallback(
    async (toolIds: number[]): Promise<ToggleResult> => {
      if (!user) return { ok: false, requiresLogin: true };

      const newIds = toolIds.filter((id) => !savedIds.has(id));
      if (newIds.length === 0) return { ok: true, requiresLogin: false };

      setSavedIds((prev) => new Set([...prev, ...newIds]));

      const supabase = createClient();
      const { error } = await supabase
        .from("saved_tools")
        .upsert(
          newIds.map((tool_id) => ({ user_id: user.id, tool_id })),
          { onConflict: "user_id,tool_id", ignoreDuplicates: true }
        );

      if (error) {
        setSavedIds((prev) => {
          const next = new Set(prev);
          for (const id of newIds) next.delete(id);
          return next;
        });
        return { ok: false, requiresLogin: false };
      }

      return { ok: true, requiresLogin: false };
    },
    [user, savedIds]
  );

  const isSaved = useCallback((toolId: number) => savedIds.has(toolId), [savedIds]);

  return (
    <SavedToolsContext.Provider value={{ isSaved, toggleSave, saveMany, savedIds, loading }}>
      {children}
    </SavedToolsContext.Provider>
  );
}

export function useSavedTools() {
  const ctx = useContext(SavedToolsContext);
  if (!ctx) {
    throw new Error("useSavedTools must be used within a SavedToolsProvider");
  }
  return ctx;
}
