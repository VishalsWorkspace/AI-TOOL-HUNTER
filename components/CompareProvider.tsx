"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "compare-tools";
const MAX_COMPARE = 3;

interface CompareContextValue {
  compareIds: number[];
  isComparing: (id: number) => boolean;
  toggleCompare: (id: number) => void;
  clearCompare: () => void;
  maxReached: boolean;
}

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const hydrate = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setCompareIds(JSON.parse(raw));
      } catch {
        // ignore malformed storage
      }
      setHydrated(true);
    };
    hydrate();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(compareIds));
  }, [compareIds, hydrated]);

  const toggleCompare = useCallback((id: number) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  }, []);

  const clearCompare = useCallback(() => setCompareIds([]), []);
  const isComparing = useCallback((id: number) => compareIds.includes(id), [compareIds]);

  return (
    <CompareContext.Provider
      value={{ compareIds, isComparing, toggleCompare, clearCompare, maxReached: compareIds.length >= MAX_COMPARE }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return ctx;
}
