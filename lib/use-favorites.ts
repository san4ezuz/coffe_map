"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "mesta-favorites";

function readStored(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  // Starts empty so server and first client render match; hydrated from localStorage
  // right after mount (same pattern as ThemeProvider).
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIds(readStored());
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: string) => ids.includes(id), [ids]);

  return { favoriteIds: ids, isFavorite, toggleFavorite };
}
